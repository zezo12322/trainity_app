import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants';

import { useChatStore } from '../stores/chatStore';
import { ChatRoom } from '../types';
// import { RTLView, useRTL } from '../components/RTLText';
// import { SafeTouchableOpacity } from '../components/SafeTouchableOpacity';
import { isRTL } from '../services/i18n';

interface ChatRoomItemProps {
  room: ChatRoom;
  onPress: () => void;
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ room, onPress }) => {
  const { t } = useTranslation();

  // Debug logging to find the issue
  React.useEffect(() => {
    if (!room.name || room.name === '' || room.name === null || room.name === undefined) {
      console.warn('ChatRoomItem: Invalid room name:', room);
    }
  }, [room]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString('ar-SA', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } else if (diffInHours < 48) {
        return t('common.yesterday') || 'أمس';
      } else {
        return date.toLocaleDateString('ar-SA');
      }
    } catch (error) {
      console.warn('Error formatting time:', error);
      return '';
    }
  };

  const getRoomIcon = () => {
    if (room.type === 'individual') {
      return 'person-circle';
    }

    switch (room.chat_type) {
      case 'announcement':
        return 'megaphone';
      case 'coordination':
        return 'people';
      case 'training_team':
        return 'school';
      default:
        return 'chatbubbles';
    }
  };

  const getRoomTypeLabel = () => {
    try {
      switch (room.chat_type) {
        case 'announcement':
          return t('chat.types.announcement') || 'إعلانات';
        case 'coordination':
          return t('chat.types.coordination') || 'تنسيق';
        case 'training_team':
          return t('chat.types.trainingTeam') || 'فريق تدريب';
        default:
          return room.type === 'individual'
            ? (t('chat.types.direct') || 'محادثة مباشرة')
            : (t('chat.types.group') || 'مجموعة');
      }
    } catch (error) {
      console.warn('Error getting room type label:', error);
      return 'محادثة';
    }
  };

  // Ensure all values are safe before rendering
  const safeName = (room?.name && typeof room.name === 'string' && room.name.trim()) || 'غرفة محادثة';
  const safeTypeLabel = getRoomTypeLabel() || 'محادثة';
  const safeLastMessage = (room?.last_message && typeof room.last_message === 'string' && room.last_message.trim()) || '';
  const safeTimeString = formatTime(room?.last_message_at) || '';
  const safeUnreadCount = (room?.unreadCount && typeof room.unreadCount === 'number' && room.unreadCount > 0) ? room.unreadCount : 0;

  return (
    <TouchableOpacity style={styles.roomItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.roomContent}>
        <View style={styles.roomIcon}>
          <Ionicons
            name={getRoomIcon() as any}
            size={24}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.roomInfo}>
          <View style={styles.roomHeader}>
            <Text style={styles.roomName} numberOfLines={1}>
              {safeName}
            </Text>
            {safeUnreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {safeUnreadCount > 99 ? '99+' : String(safeUnreadCount)}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.roomType} numberOfLines={1}>
            {safeTypeLabel}
          </Text>

          {safeLastMessage && (
            <Text style={styles.lastMessage} numberOfLines={2}>
              {safeLastMessage}
            </Text>
          )}
        </View>

        <View style={styles.roomMeta}>
          {safeTimeString && (
            <Text style={styles.timeText}>
              {safeTimeString}
            </Text>
          )}
          {room?.is_read_only && (
            <Ionicons
              name="lock-closed"
              size={16}
              color={COLORS.light.textSecondary}
              style={{ marginTop: SIZES.xs }}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const ChatScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const rtl = isRTL();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {
    chatRooms,
    isLoading,
    error,
    fetchChatRooms,
    subscribeToRooms,
    canCreateChat,
    clearError,
  } = useChatStore();

  // Load chat rooms on focus
  useFocusEffect(
    useCallback(() => {
      fetchChatRooms();
      const unsubscribe = subscribeToRooms();
      return unsubscribe;
    }, [])
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChatRooms();
    setRefreshing(false);
  }, [fetchChatRooms]);

  // Filter rooms based on search
  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle room press
  const handleRoomPress = (room: ChatRoom) => {
    (navigation as any).navigate('ChatRoom', { roomId: room.id, roomName: room.name });
  };

  // Handle create chat
  const handleCreateChat = () => {
    if (!canCreateChat()) {
      Alert.alert(
        t('common.error'),
        t('chat.errors.noPermission')
      );
      return;
    }

    Alert.alert(
      t('chat.createChat'),
      t('chat.selectChatType'),
      [
        {
          text: t('chat.directChat'),
          onPress: () => (navigation as any).navigate('CreateDirectChat'),
        },
        {
          text: t('chat.groupChat'),
          onPress: () => (navigation as any).navigate('CreateGroupChat'),
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  if (isLoading && chatRooms.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('chat.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('chat.title')}</Text>
        {canCreateChat() && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateChat}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.light.textSecondary}
            style={[styles.searchIcon, { marginRight: rtl ? 0 : SIZES.sm, marginLeft: rtl ? SIZES.sm : 0 }]}
          />
          <TextInput
            style={[styles.searchInput, { textAlign: rtl ? 'right' : 'left' }]}
            placeholder={t('chat.searchChats')}
            placeholderTextColor={COLORS.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.errorDismiss}>{t('common.dismiss')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chat List */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item, index }) => (
          <ChatRoomItem
            key={`room-${item.id}-${index}`}
            room={item}
            onPress={() => handleRoomPress(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={COLORS.light.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery ? t('chat.noSearchResults') : t('chat.noChats')}
            </Text>
            {canCreateChat() && !searchQuery && (
              <TouchableOpacity style={styles.createFirstButton} onPress={handleCreateChat}>
                <Text style={styles.createFirstText}>{t('chat.createFirstChat')}</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={filteredRooms.length === 0 ? styles.emptyList : undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.md,
    fontSize: SIZES.body,
    color: COLORS.light.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  createButton: {
    padding: SIZES.sm,
  },
  searchContainer: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light.surface,
    borderRadius: SIZES.radiusMedium,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  searchIcon: {
    marginRight: SIZES.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.light.text,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '20',
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMedium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: SIZES.caption,
  },
  errorDismiss: {
    color: COLORS.error,
    fontSize: SIZES.caption,
    fontWeight: '600',
  },
  roomItem: {
    backgroundColor: COLORS.light.surface,
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.xs,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
  },
  roomContent: {
    alignItems: 'center',
  },
  roomIcon: {
    marginRight: SIZES.md,
  },
  roomInfo: {
    flex: 1,
  },
  roomHeader: {
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  roomName: {
    flex: 1,
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.light.text,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xs,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: SIZES.caption,
    fontWeight: 'bold',
  },
  roomType: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    marginBottom: SIZES.xs,
  },
  lastMessage: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
  },
  roomMeta: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: SIZES.h5,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.lg,
    marginBottom: SIZES.xl,
  },
  createFirstButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMedium,
  },
  createFirstText: {
    color: '#FFFFFF',
    fontSize: SIZES.body,
    fontWeight: '600',
  },
});
