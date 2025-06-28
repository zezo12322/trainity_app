import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

class CacheService {
  private memoryCache = new Map<string, CacheItem<any>>();

  // Default cache duration: 5 minutes
  private defaultCacheDuration = 5 * 60 * 1000;

  public async set<T>(
    key: string,
    data: T,
    expiresIn: number = this.defaultCacheDuration
  ): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };

    // Store in memory cache
    this.memoryCache.set(key, cacheItem);

    // Store in persistent storage
    try {
      const cacheKey = `${STORAGE_KEYS.CACHED_DATA}_${key}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Failed to cache data to storage:', error);
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    // First check memory cache
    const memoryCacheItem = this.memoryCache.get(key);
    if (memoryCacheItem && !this.isExpired(memoryCacheItem)) {
      return memoryCacheItem.data as T;
    }

    // If not in memory or expired, check persistent storage
    try {
      const cacheKey = `${STORAGE_KEYS.CACHED_DATA}_${key}`;
      const stored = await AsyncStorage.getItem(cacheKey);
      
      if (stored) {
        const cacheItem: CacheItem<T> = JSON.parse(stored);
        
        if (!this.isExpired(cacheItem)) {
          // Update memory cache
          this.memoryCache.set(key, cacheItem);
          return cacheItem.data;
        } else {
          // Remove expired item
          await this.remove(key);
        }
      }
    } catch (error) {
      console.error('Failed to get cached data:', error);
    }

    return null;
  }

  public async remove(key: string): Promise<void> {
    // Remove from memory cache
    this.memoryCache.delete(key);

    // Remove from persistent storage
    try {
      const cacheKey = `${STORAGE_KEYS.CACHED_DATA}_${key}`;
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Failed to remove cached data:', error);
    }
  }

  public async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear persistent storage
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CACHED_DATA));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  public async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  private isExpired(cacheItem: CacheItem<any>): boolean {
    const now = Date.now();
    return now - cacheItem.timestamp > cacheItem.expiresIn;
  }

  public async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    expiresIn: number = this.defaultCacheDuration
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch and cache
    try {
      const data = await fetcher();
      await this.set(key, data, expiresIn);
      return data;
    } catch (error) {
      console.error('Failed to fetch and cache data:', error);
      throw error;
    }
  }

  public async invalidatePattern(pattern: string): Promise<void> {
    // Invalidate memory cache
    const memoryKeys = Array.from(this.memoryCache.keys());
    memoryKeys.forEach(key => {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    });

    // Invalidate persistent storage
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith(STORAGE_KEYS.CACHED_DATA) && key.includes(pattern)
      );
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to invalidate cache pattern:', error);
    }
  }

  public getMemoryCacheSize(): number {
    return this.memoryCache.size;
  }

  public async getPersistentCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(key => key.startsWith(STORAGE_KEYS.CACHED_DATA)).length;
    } catch (error) {
      console.error('Failed to get persistent cache size:', error);
      return 0;
    }
  }
}

export const cacheService = new CacheService();
