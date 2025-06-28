import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { ChatRoom, ChatMessage, User } from '../types';
import { useAuthStore } from './authStore';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatState {
  // State
  chatRooms: ChatRoom[];
  messages: Record<string, ChatMessage[]>;
  activeUsers: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
  currentRoomId: string | null;
  unreadCounts: Record<string, number>;

  // Realtime subscriptions
  roomSubscription: RealtimeChannel | null;
  messageSubscription: RealtimeChannel | null;

  // Actions
  fetchChatRooms: () => Promise<void>;
  fetchMessages: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, content: string, type?: 'text' | 'image' | 'file') => Promise<void>;
  createDirectChat: (targetUserId: string) => Promise<string | null>;
  createGroupChat: (name: string, participantIds: string[], description?: string) => Promise<string | null>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  markAsRead: (roomId: string, messageId?: string) => Promise<void>;

  // Realtime
  subscribeToRooms: () => () => void;
  subscribeToMessages: (roomId: string) => () => void;
  subscribeToUserStatus: () => () => void;

  // Permissions
  canCreateChat: () => boolean;
  canSendMessage: (roomId: string) => boolean;
  getUserPermissions: () => {
    canCreateDirectChat: boolean;
    canCreateGroupChat: boolean;
    canJoinAnyRoom: boolean;
  };

  // Utilities
  setCurrentRoom: (roomId: string | null) => void;
  clearError: () => void;
  clearMessages: (roomId: string) => void;
  getUnreadCount: (roomId: string) => number;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  chatRooms: [],
  messages: {},
  activeUsers: {},
  isLoading: false,
  error: null,
  currentRoomId: null,
  unreadCounts: {},
  roomSubscription: null,
  messageSubscription: null,

  // Fetch chat rooms for current user
  fetchChatRooms: async () => {
    try {
      set({ isLoading: true, error: null });
      const { user } = useAuthStore.getState();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // First, get rooms where user is a participant
      const { data: participantRooms, error: participantError } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_participants!inner(
            user_id,
            role,
            last_read_at,
            is_muted
          )
        `)
        .eq('chat_participants.user_id', user.id)
        .eq('is_archived', false);

      if (participantError) throw participantError;

      // Then, get rooms where user has role-based access
      const { data: roleRooms, error: roleError } = await supabase
        .from('chat_rooms')
        .select('*')
        .not('allowed_roles', 'is', null)
        .eq('is_archived', false);

      if (roleError) throw roleError;

      // Combine and deduplicate rooms
      const allRoomsMap = new Map();

      // Add participant rooms
      participantRooms?.forEach(room => {
        allRoomsMap.set(room.id, {
          ...room,
          unreadCount: 0 // Will be calculated below
        });
      });

      // Add role-based rooms (if not already added and user has access)
      roleRooms?.forEach(room => {
        if (!allRoomsMap.has(room.id)) {
          // Check if user role is in allowed_roles
          if (room.allowed_roles && room.allowed_roles.includes(user.role)) {
            allRoomsMap.set(room.id, {
              ...room,
              chat_participants: [],
              unreadCount: 0 // Will be calculated below
            });
          }
        }
      });

      const rooms = Array.from(allRoomsMap.values())
        .sort((a, b) => {
          // Sort by last message time, then by name
          const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
          const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
          if (timeA !== timeB) return timeB - timeA; // Most recent first
          return a.name.localeCompare(b.name);
        });

      // Calculate unread counts
      const unreadCounts: Record<string, number> = {};
      for (const room of rooms || []) {
        const { data: unreadMessages } = await supabase
          .from('chat_messages')
          .select('id')
          .eq('chat_room_id', room.id)
          .gt('created_at', room.chat_participants?.[0]?.last_read_at || '1970-01-01')
          .neq('sender_id', user.id);

        unreadCounts[room.id] = unreadMessages?.length || 0;
      }

      set({
        chatRooms: rooms || [],
        unreadCounts,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch chat rooms',
        isLoading: false
      });
    }
  },

  // Fetch messages for a specific room
  fetchMessages: async (roomId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:users!chat_messages_sender_id_fkey(
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('chat_room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      set(state => ({
        messages: {
          ...state.messages,
          [roomId]: messages || []
        },
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
        isLoading: false
      });
    }
  },

  // Send a message
  sendMessage: async (roomId: string, content: string, type = 'text') => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');

      // Check permissions
      if (!get().canSendMessage(roomId)) {
        throw new Error('You do not have permission to send messages in this room');
      }

      const messageData = {
        chat_room_id: roomId,
        sender_id: user.id,
        content: content.trim(),
        message_type: type,
      };

      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select(`
          *,
          sender:users!chat_messages_sender_id_fkey(
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .single();

      if (error) throw error;

      // Update room's last message and timestamp
      await supabase
        .from('chat_rooms')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId);

      // Send notifications to other participants
      try {
        await get().sendMessageNotifications(roomId, content, message.sender_id);
      } catch (notificationError) {
        console.warn('Failed to send notifications:', notificationError);
        // Don't fail the message sending if notifications fail
      }

      // Add message to local state
      set(state => ({
        messages: {
          ...state.messages,
          [roomId]: [...(state.messages[roomId] || []), message]
        }
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to send message'
      });
    }
  },

  // Create direct chat
  createDirectChat: async (targetUserId: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');

      if (!get().canCreateChat()) {
        throw new Error('You do not have permission to create chats');
      }

      // Check if chat already exists
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('type', 'individual')
        .contains('participants', [user.id, targetUserId])
        .single();

      if (existingRoom) {
        return existingRoom.id;
      }

      // Get target user info
      const { data: targetUser } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', targetUserId)
        .single();

      // Create new direct chat
      const { data: room, error } = await supabase
        .from('chat_rooms')
        .insert({
          name: `${user.fullName} & ${targetUser?.full_name}`,
          type: 'individual',
          chat_type: 'direct',
          participants: [user.id, targetUserId],
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add participants
      await supabase
        .from('chat_participants')
        .insert([
          { chat_room_id: room.id, user_id: user.id, role: 'admin' },
          { chat_room_id: room.id, user_id: targetUserId, role: 'member' }
        ]);

      // Refresh rooms
      await get().fetchChatRooms();

      return room.id;
    } catch (error) {
      console.error('Error creating direct chat:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create direct chat'
      });
      return null;
    }
  },

  // Create group chat
  createGroupChat: async (name: string, participantIds: string[], description?: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');

      if (!get().canCreateChat()) {
        throw new Error('You do not have permission to create group chats');
      }

      const { data: room, error } = await supabase
        .from('chat_rooms')
        .insert({
          name,
          description,
          type: 'group',
          chat_type: 'custom',
          participants: [user.id, ...participantIds],
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add participants
      const participants = [
        { chat_room_id: room.id, user_id: user.id, role: 'admin' },
        ...participantIds.map(id => ({
          chat_room_id: room.id,
          user_id: id,
          role: 'member'
        }))
      ];

      await supabase
        .from('chat_participants')
        .insert(participants);

      // Refresh rooms
      await get().fetchChatRooms();

      return room.id;
    } catch (error) {
      console.error('Error creating group chat:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create group chat'
      });
      return null;
    }
  },

  // Join room
  joinRoom: async (roomId: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');

      await supabase
        .from('chat_participants')
        .insert({
          chat_room_id: roomId,
          user_id: user.id,
          role: 'member'
        });

      await get().fetchChatRooms();
    } catch (error) {
      console.error('Error joining room:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to join room'
      });
    }
  },

  // Leave room
  leaveRoom: async (roomId: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');

      await supabase
        .from('chat_participants')
        .delete()
        .eq('chat_room_id', roomId)
        .eq('user_id', user.id);

      await get().fetchChatRooms();
    } catch (error) {
      console.error('Error leaving room:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to leave room'
      });
    }
  },

  // Mark messages as read
  markAsRead: async (roomId: string, messageId?: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');

      await supabase
        .from('chat_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('chat_room_id', roomId)
        .eq('user_id', user.id);

      // Update local unread count
      set(state => ({
        unreadCounts: {
          ...state.unreadCounts,
          [roomId]: 0
        }
      }));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  },

  // Check if user can create chats
  canCreateChat: () => {
    const { user } = useAuthStore.getState();
    if (!user) return false;

    const allowedRoles = ['PM', 'SV', 'DV']; // Project Manager, Supervisor, Development Officer

    return allowedRoles.includes(user.role);
  },

  // Check if user can send message in room
  canSendMessage: (roomId: string) => {
    const { user } = useAuthStore.getState();
    const { chatRooms } = get();

    if (!user) return false;

    const room = chatRooms.find(r => r.id === roomId);
    if (!room) return false;

    // Check if room is read-only
    if (room.is_read_only) {
      // Only allowed roles can send in read-only rooms
      return room.allowed_roles?.includes(user.role) || false;
    }

    return true;
  },

  // Get user permissions
  getUserPermissions: () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      return {
        canCreateDirectChat: false,
        canCreateGroupChat: false,
        canJoinAnyRoom: false
      };
    }

    const isManager = user.role === 'PM'; // Project Manager
    const isSupervisor = user.role === 'SV'; // Supervisor
    const isCoordinator = user.role === 'DV'; // Development Officer

    return {
      canCreateDirectChat: isManager || isSupervisor || isCoordinator,
      canCreateGroupChat: isManager || isSupervisor || isCoordinator,
      canJoinAnyRoom: isManager
    };
  },

  // Subscribe to room updates
  subscribeToRooms: () => {
    const { user } = useAuthStore.getState();
    if (!user) return () => {};

    const subscription = supabase
      .channel('chat_rooms_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        () => {
          get().fetchChatRooms();
        }
      )
      .subscribe();

    set({ roomSubscription: subscription });

    return () => {
      subscription.unsubscribe();
      set({ roomSubscription: null });
    };
  },

  // Subscribe to messages in a room
  subscribeToMessages: (roomId: string) => {
    const subscription = supabase
      .channel(`messages_${roomId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${roomId}`
        },
        async (payload) => {
          // Fetch the complete message with sender info
          const { data: message } = await supabase
            .from('chat_messages')
            .select(`
              *,
              sender:users!chat_messages_sender_id_fkey(
                id,
                full_name,
                avatar_url,
                role
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (message) {
            set(state => ({
              messages: {
                ...state.messages,
                [roomId]: [...(state.messages[roomId] || []), message]
              }
            }));
          }
        }
      )
      .subscribe();

    set({ messageSubscription: subscription });

    return () => {
      subscription.unsubscribe();
      set({ messageSubscription: null });
    };
  },

  // Subscribe to user status
  subscribeToUserStatus: () => {
    // Presence system implementation
    const { supabase } = get();
    if (!supabase) return () => {};

    const channel = supabase.channel('user-presence')
      .on('presence', { event: 'sync' }, () => {
        // Handle presence updates
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  },

  // Set current room
  setCurrentRoom: (roomId: string | null) => {
    set({ currentRoomId: roomId });

    if (roomId) {
      // Mark as read when entering room
      get().markAsRead(roomId);
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Clear messages for a room
  clearMessages: (roomId: string) => {
    set(state => ({
      messages: { ...state.messages, [roomId]: [] }
    }));
  },

  // Get unread count for a room
  getUnreadCount: (roomId: string) => {
    const { unreadCounts } = get();
    return unreadCounts[roomId] || 0;
  },

  // Send message notifications to other participants
  sendMessageNotifications: async (roomId: string, content: string, senderId: string) => {
    try {
      const { supabase } = get();
      if (!supabase) return;

      // Get room participants (excluding sender)
      const { data: participants } = await supabase
        .from('chat_room_participants')
        .select('user_id, users(full_name)')
        .eq('room_id', roomId)
        .neq('user_id', senderId);

      if (!participants) return;

      // Get room name
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('name')
        .eq('id', roomId)
        .single();

      const roomName = room?.name || 'محادثة';

      // Create notifications for each participant
      const notifications = participants.map(participant => ({
        user_id: participant.user_id,
        title: `رسالة جديدة في ${roomName}`,
        body: content.length > 50 ? content.substring(0, 50) + '...' : content,
        type: 'chat_message',
        data: {
          room_id: roomId,
          room_name: roomName,
          sender_id: senderId
        },
        is_read: false,
        created_at: new Date().toISOString()
      }));

      // Insert notifications
      await supabase
        .from('notifications')
        .insert(notifications);

    } catch (error) {
      console.error('Error sending message notifications:', error);
    }
  },
}));
