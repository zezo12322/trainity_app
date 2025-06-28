import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { RTLView, useRTL } from '../components/RTLText';
import { NetworkStatus } from '../components/NetworkStatus';
import { SIZES } from '../constants';
import { supabase } from '../services/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'training' | 'chat' | 'system' | 'approval';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export const NotificationsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isRTL: rtl } = useRTL();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match component interface
      const transformedNotifications = data?.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.body,
        type: notification.type as 'training' | 'chat' | 'system' | 'approval',
        isRead: notification.is_read,
        createdAt: notification.created_at,
        data: notification.data
      })) || [];

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    Alert.alert(
      t('notifications.deleteNotification'),
      t('notifications.deleteConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

              setNotifications(prev =>
                prev.filter(notification => notification.id !== notificationId)
              );
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'training':
        return 'school';
      case 'chat':
        return 'chatbubble';
      case 'approval':
        return 'checkmark-circle';
      case 'system':
        return 'settings';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'training':
        return theme.colors.primary;
      case 'chat':
        return theme.colors.success;
      case 'approval':
        return theme.colors.warning;
      case 'system':
        return theme.colors.textSecondary;
      default:
        return theme.colors.primary;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return t('notifications.justNow');
    } else if (diffInMinutes < 60) {
      return t('notifications.minutesAgo', { count: diffInMinutes });
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return t('notifications.hoursAgo', { count: hours });
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return t('notifications.daysAgo', { count: days });
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    filter === 'all' || !notification.isRead
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        !item.isRead && { backgroundColor: theme.colors.primary + '05' },
      ]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <RTLView style={styles.notificationContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(item.type) + '20' }
        ]}>
          <Ionicons
            name={getNotificationIcon(item.type) as any}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>

        <View style={styles.textContainer}>
          <RTLView style={styles.titleRow}>
            <Text style={[
              styles.title,
              { color: theme.colors.text },
              !item.isRead && styles.unreadTitle,
            ]}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </RTLView>

          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            {item.message}
          </Text>

          <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <Ionicons name="close" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </RTLView>
    </TouchableOpacity>
  );

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatus />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllRead}>{t('notifications.markAllRead')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'all' && styles.activeFilterTab,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterText,
            filter === 'all' && styles.activeFilterText,
          ]}>
            {t('notifications.all')} ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'unread' && styles.activeFilterTab,
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[
            styles.filterText,
            filter === 'unread' && styles.activeFilterText,
          ]}>
            {t('notifications.unread')} ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {filter === 'unread'
                ? t('notifications.noUnread')
                : t('notifications.noNotifications')
              }
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  markAllRead: {
    fontSize: SIZES.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    gap: SIZES.sm,
  },
  filterTab: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusSmall,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeFilterTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: SIZES.caption,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: SIZES.lg,
  },
  notificationCard: {
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderWidth: 1,
  },
  notificationContent: {
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  title: {
    fontSize: SIZES.body,
    fontWeight: '600',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: SIZES.xs,
  },
  message: {
    fontSize: SIZES.caption,
    lineHeight: 18,
    marginBottom: SIZES.xs,
  },
  time: {
    fontSize: SIZES.caption,
    fontWeight: '500',
  },
  deleteButton: {
    padding: SIZES.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.xl * 2,
  },
  emptyText: {
    fontSize: SIZES.body,
    textAlign: 'center',
    marginTop: SIZES.md,
  },
});
