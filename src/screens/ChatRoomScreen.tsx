import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants';
import { isRTL } from '../services/i18n';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { ChatMessage } from '../types';
// import { RTLView, useRTL } from '../components/RTLText';

interface MessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
  showSender: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, showSender }) => {
  const rtl = isRTL();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <View style={[
      styles.messageContainer,
      isOwn ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      {showSender && !isOwn && (
        <Text style={styles.senderName}>
          {message.sender?.full_name || 'مستخدم'}
        </Text>
      )}

      <View style={[
        styles.messageBubble,
        isOwn ? styles.ownMessageBubble : styles.otherMessageBubble
      ]}>
        <Text style={[
          styles.messageText,
          isOwn ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {message.content}
        </Text>

        <Text style={[
          styles.messageTime,
          isOwn ? styles.ownMessageTime : styles.otherMessageTime
        ]}>
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
};

export const ChatRoomScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const rtl = isRTL();
  const getIconName = (icon: string) => icon; // Simple fallback

  const { roomId, roomName } = route.params as { roomId: string; roomName: string };

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    isLoading,
    error,
    fetchMessages,
    sendMessage,
    subscribeToMessages,
    canSendMessage,
    setCurrentRoom,
    clearError,
  } = useChatStore();

  const { user } = useAuthStore();
  const roomMessages = messages[roomId] || [];

  // Load messages and subscribe to updates
  useFocusEffect(
    useCallback(() => {
      setCurrentRoom(roomId);
      fetchMessages(roomId);
      const unsubscribe = subscribeToMessages(roomId);

      return () => {
        unsubscribe();
        setCurrentRoom(null);
      };
    }, [roomId])
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (roomMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [roomMessages.length]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;

    if (!canSendMessage(roomId)) {
      Alert.alert(
        t('common.error'),
        t('chat.errors.cannotSend')
      );
      return;
    }

    const text = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      await sendMessage(roomId, text);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageText(text); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  // Group messages by sender for better UI
  const processedMessages = roomMessages.map((message, index) => {
    const prevMessage = index > 0 ? roomMessages[index - 1] : null;
    const showSender = !prevMessage || prevMessage.sender_id !== message.sender_id;

    return {
      ...message,
      showSender,
      isOwn: message.sender_id === user?.id,
    };
  });

  const renderMessage = ({ item, index }: { item: ChatMessage & { showSender: boolean; isOwn: boolean }, index: number }) => (
    <MessageItem
      key={`message-${item.id}-${index}`}
      message={item}
      isOwn={item.isOwn}
      showSender={item.showSender}
    />
  );

  if (isLoading && roomMessages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name={getIconName('arrow-back') as any}
              size={24}
              color={COLORS.light.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{roomName}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('chat.loadingMessages')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name={getIconName('arrow-back') as any}
            size={24}
            color={COLORS.light.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {roomName}
        </Text>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.light.text} />
        </TouchableOpacity>
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

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={processedMessages}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={COLORS.light.textSecondary} />
              <Text style={styles.emptyText}>{t('chat.noMessages')}</Text>
              <Text style={styles.emptySubtext}>{t('chat.startConversation')}</Text>
            </View>
          }
        />

        {/* Input */}
        {canSendMessage(roomId) && (
          <View style={styles.inputContainer}>
            <View style={styles.inputBox}>
              <TextInput
                style={[styles.textInput, { textAlign: rtl ? 'right' : 'left' }]}
                placeholder={t('chat.typeMessage')}
                placeholderTextColor={COLORS.light.textSecondary}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!messageText.trim() || isSending) && styles.sendButtonDisabled
                ]}
                onPress={handleSendMessage}
                disabled={!messageText.trim() || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name={getIconName('send') as any}
                    size={20}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
    backgroundColor: COLORS.light.surface,
  },
  headerTitle: {
    flex: 1,
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.light.text,
    textAlign: 'center',
    marginHorizontal: SIZES.md,
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
  errorContainer: {
    backgroundColor: COLORS.error + '20',
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.sm,
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
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },
  emptyText: {
    fontSize: SIZES.h5,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.lg,
  },
  emptySubtext: {
    fontSize: SIZES.body,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.sm,
  },
  messageContainer: {
    marginVertical: SIZES.xs,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    marginBottom: SIZES.xs,
    marginHorizontal: SIZES.md,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusLarge,
  },
  ownMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: SIZES.radiusSmall,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.light.surface,
    borderBottomLeftRadius: SIZES.radiusSmall,
  },
  messageText: {
    fontSize: SIZES.body,
    lineHeight: SIZES.body * 1.4,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: COLORS.light.text,
  },
  messageTime: {
    fontSize: SIZES.caption,
    marginTop: SIZES.xs,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: COLORS.light.textSecondary,
    textAlign: 'left',
  },
  inputContainer: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.light.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.border,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.light.background,
    borderRadius: SIZES.radiusLarge,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.light.text,
    maxHeight: 80,
    minHeight: 40,
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.light.textSecondary,
  },
});
