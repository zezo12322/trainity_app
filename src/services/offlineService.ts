import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { OfflineAction } from '../types';
import { STORAGE_KEYS } from '../constants';

class OfflineService {
  private isOnline: boolean = true;
  private actionQueue: OfflineAction[] = [];
  private listeners: ((isOnline: boolean) => void)[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    // Load offline actions from storage
    await this.loadOfflineActions();

    // Listen to network changes
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (!wasOnline && this.isOnline) {
        // Just came back online, process queued actions
        this.processOfflineActions();
      }

      // Notify listeners
      this.listeners.forEach(listener => listener(this.isOnline));
    });
  }

  public getNetworkState(): boolean {
    return this.isOnline;
  }

  public addNetworkListener(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) {
    const offlineAction: OfflineAction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      retryCount: 0,
      ...action,
    };

    this.actionQueue.push(offlineAction);
    await this.saveOfflineActions();

    // If online, try to process immediately
    if (this.isOnline) {
      await this.processOfflineActions();
    }
  }

  private async loadOfflineActions() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_ACTIONS);
      if (stored) {
        this.actionQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline actions:', error);
    }
  }

  private async saveOfflineActions() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_ACTIONS,
        JSON.stringify(this.actionQueue)
      );
    } catch (error) {
      console.error('Failed to save offline actions:', error);
    }
  }

  public async processOfflineActions() {
    if (!this.isOnline || this.actionQueue.length === 0) {
      return;
    }

    const actionsToProcess = [...this.actionQueue];
    const failedActions: OfflineAction[] = [];

    for (const action of actionsToProcess) {
      try {
        await this.executeAction(action);
        // Remove successful action from queue
        const index = this.actionQueue.findIndex(a => a.id === action.id);
        if (index > -1) {
          this.actionQueue.splice(index, 1);
        }
      } catch (error) {
        console.error('Failed to execute offline action:', error);

        // Increment retry count
        action.retryCount++;

        // If retry count exceeds limit, remove action
        if (action.retryCount >= 3) {
          const index = this.actionQueue.findIndex(a => a.id === action.id);
          if (index > -1) {
            this.actionQueue.splice(index, 1);
          }
        } else {
          failedActions.push(action);
        }
      }
    }

    await this.saveOfflineActions();
  }

  private async executeAction(action: OfflineAction): Promise<void> {
    const { supabase } = await import('./supabase');

    switch (action.type) {
      case 'CREATE_TRAINING_REQUEST':
        const { error: createError } = await supabase
          .from('training_requests')
          .insert(action.data);
        if (createError) throw createError;
        break;

      case 'UPDATE_TRAINING_REQUEST':
        const { error: updateError } = await supabase
          .from('training_requests')
          .update(action.data.updates)
          .eq('id', action.data.id);
        if (updateError) throw updateError;
        break;

      case 'SEND_MESSAGE':
        const { error: messageError } = await supabase
          .from('chat_messages')
          .insert(action.data);
        if (messageError) throw messageError;
        break;

      case 'MARK_NOTIFICATION_READ':
        const { error: notificationError } = await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('id', action.data.id);
        if (notificationError) throw notificationError;
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  public async clearOfflineActions() {
    this.actionQueue = [];
    await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_ACTIONS);
  }

  public getQueuedActionsCount(): number {
    return this.actionQueue.length;
  }

  public getQueuedActions(): OfflineAction[] {
    return [...this.actionQueue];
  }

  // Cache Management
  public async cacheData(key: string, data: any, expirationMinutes: number = 5): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + (expirationMinutes * 60 * 1000)
      };

      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  public async getCachedData(key: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);

      // Check if expired
      if (Date.now() > cacheData.expiresAt) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  public async clearCache(key?: string): Promise<void> {
    try {
      if (key) {
        await AsyncStorage.removeItem(`cache_${key}`);
      } else {
        // Clear all cache
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(k => k.startsWith('cache_'));
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // Smart fetch with cache fallback
  public async fetchWithCache<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    cacheMinutes: number = 5
  ): Promise<T> {
    // Try cache first
    const cached = await this.getCachedData(key);
    if (cached) {
      return cached;
    }

    // If online, fetch fresh data
    if (this.isOnline) {
      try {
        const data = await fetchFunction();
        await this.cacheData(key, data, cacheMinutes);
        return data;
      } catch (error) {
        // If fetch fails, try to get expired cache as fallback
        const expiredCache = await this.getExpiredCache(key);
        if (expiredCache) {
          return expiredCache;
        }
        throw error;
      }
    }

    // If offline, try expired cache
    const expiredCache = await this.getExpiredCache(key);
    if (expiredCache) {
      return expiredCache;
    }

    throw new Error('No data available offline');
  }

  private async getExpiredCache(key: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      return cacheData.data;
    } catch (error) {
      return null;
    }
  }
}

export const offlineService = new OfflineService();
