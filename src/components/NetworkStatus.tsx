import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { offlineService } from '../services/offlineService';
import { COLORS, SIZES } from '../constants';

interface NetworkStatusProps {
  showDetails?: boolean;
  style?: any;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  showDetails = false,
  style,
}) => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(true);
  const [queuedActions, setQueuedActions] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    // Initial state
    setIsOnline(offlineService.getNetworkState());
    setQueuedActions(offlineService.getQueuedActionsCount());

    // Listen to network changes
    const unsubscribe = offlineService.addNetworkListener((online) => {
      setIsOnline(online);
      setQueuedActions(offlineService.getQueuedActionsCount());

      // Show banner when going offline
      if (!online) {
        setShowBanner(true);
        Animated.timing(bannerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        // Hide banner when coming back online
        Animated.timing(bannerOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowBanner(false);
        });
      }
    });

    return unsubscribe;
  }, [bannerOpacity]);

  const handleSyncPress = async () => {
    if (isOnline && queuedActions > 0) {
      // Trigger manual sync
      try {
        await offlineService.processOfflineActions();
        setQueuedActions(offlineService.getQueuedActionsCount());
      } catch (error) {
        console.error('Manual sync failed:', error);
      }
    }
  };

  if (!showDetails && isOnline) {
    return null; // Don't show anything when online and not showing details
  }

  const getStatusColor = () => {
    if (isOnline) {
      return queuedActions > 0 ? COLORS.warning : COLORS.success;
    }
    return COLORS.error;
  };

  const getStatusText = () => {
    if (isOnline) {
      if (queuedActions > 0) {
        return t('networkStatus.syncing', { count: queuedActions });
      }
      return t('networkStatus.online');
    }
    return t('networkStatus.offline');
  };

  const getStatusIcon = () => {
    if (isOnline) {
      return queuedActions > 0 ? 'sync' : 'wifi';
    }
    return 'wifi-outline';
  };

  if (showDetails) {
    // Detailed status component
    return (
      <TouchableOpacity
        style={[styles.detailedContainer, style]}
        onPress={handleSyncPress}
        disabled={!isOnline || queuedActions === 0}
        activeOpacity={0.7}
      >
        <View style={styles.statusRow}>
          <Ionicons
            name={getStatusIcon() as any}
            size={16}
            color={getStatusColor()}
          />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        {queuedActions > 0 && (
          <Text style={styles.queueText}>
            {t('networkStatus.pendingActions', { count: queuedActions })}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // Banner component (shown when offline)
  if (!showBanner) return null;

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        { opacity: bannerOpacity },
        style,
      ]}
    >
      <View style={styles.bannerContent}>
        <Ionicons
          name="wifi-outline"
          size={16}
          color="#FFFFFF"
        />
        <Text style={styles.bannerText}>
          {t('networkStatus.offlineBanner')}
        </Text>
        {queuedActions > 0 && (
          <View style={styles.queueBadge}>
            <Text style={styles.queueBadgeText}>{queuedActions}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  detailedContainer: {
    backgroundColor: COLORS.light.surface,
    borderRadius: SIZES.radiusSmall,
    padding: SIZES.sm,
    marginVertical: SIZES.xs,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  statusText: {
    fontSize: SIZES.caption,
    fontWeight: '600',
  },
  queueText: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    marginTop: SIZES.xs,
  },
  bannerContainer: {
    backgroundColor: COLORS.error,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: SIZES.caption,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  queueBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  queueBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
