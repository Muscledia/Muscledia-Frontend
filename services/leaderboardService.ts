import { apiGet } from './api';
import { buildURL } from '@/config/api';
import { LeaderboardResponse, LeaderboardType } from '@/types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = 'leaderboard_cache_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CachedData {
  data: LeaderboardResponse;
  timestamp: number;
}

export class LeaderboardService {
  /**
   * Get cache key for a specific leaderboard type
   */
  private static getCacheKey(type: LeaderboardType): string {
    return `${CACHE_KEY_PREFIX}${type.toLowerCase()}`;
  }

  /**
   * Check if cached data is still valid
   */
  private static isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_TTL;
  }

  /**
   * Get cached leaderboard data
   */
  private static async getCachedData(type: LeaderboardType): Promise<LeaderboardResponse | null> {
    try {
      const cacheKey = this.getCacheKey(type);
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const parsed: CachedData = JSON.parse(cached);
      
      if (this.isCacheValid(parsed.timestamp)) {
        console.log(`[LeaderboardService] Using cached data for ${type}`);
        return parsed.data;
      }

      // Cache expired, remove it
      await AsyncStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
      console.error('[LeaderboardService] Error reading cache:', error);
      return null;
    }
  }

  /**
   * Cache leaderboard data
   */
  private static async setCachedData(type: LeaderboardType, data: LeaderboardResponse): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(type);
      const cacheData: CachedData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log(`[LeaderboardService] Cached data for ${type}`);
    } catch (error) {
      console.error('[LeaderboardService] Error caching data:', error);
    }
  }

  /**
   * Clear cache for a specific leaderboard type
   */
  static async clearCache(type?: LeaderboardType): Promise<void> {
    try {
      if (type) {
        const cacheKey = this.getCacheKey(type);
        await AsyncStorage.removeItem(cacheKey);
        console.log(`[LeaderboardService] Cleared cache for ${type}`);
      } else {
        // Clear all leaderboard caches
        const keys = await AsyncStorage.getAllKeys();
        const leaderboardKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
        await AsyncStorage.multiRemove(leaderboardKeys);
        console.log('[LeaderboardService] Cleared all leaderboard caches');
      }
    } catch (error) {
      console.error('[LeaderboardService] Error clearing cache:', error);
    }
  }

  /**
   * Get points leaderboard
   */
  static async getPointsLeaderboard(useCache: boolean = true): Promise<LeaderboardResponse> {
    const url = buildURL('/api/gamification/leaderboards/points');
    
    // Try cache first
    if (useCache) {
      const cached = await this.getCachedData('POINTS');
      if (cached) return cached;
    }

    try {
      // The backend returns the full LeaderboardResponse structure
      // apiGet wraps it in ApiResponse, so response.data is the LeaderboardResponse
      const response = await apiGet<LeaderboardResponse['data']>(url);
      
      const leaderboardResponse: LeaderboardResponse = {
        success: response.success ?? true,
        message: response.message || 'Points leaderboard retrieved successfully',
        data: response.data!,
        timestamp: response.timestamp || new Date().toISOString(),
      };

      // Cache the response
      await this.setCachedData('POINTS', leaderboardResponse);
      
      return leaderboardResponse;
    } catch (error: any) {
      console.error('[LeaderboardService] Error fetching points leaderboard:', error);
      throw new Error(error.message || 'Failed to fetch points leaderboard');
    }
  }

  /**
   * Get levels leaderboard
   */
  static async getLevelsLeaderboard(useCache: boolean = true): Promise<LeaderboardResponse> {
    const url = buildURL('/api/gamification/leaderboards/levels');
    
    // Try cache first
    if (useCache) {
      const cached = await this.getCachedData('LEVELS');
      if (cached) return cached;
    }

    try {
      // The backend returns the full LeaderboardResponse structure
      // apiGet wraps it in ApiResponse, so response.data is the LeaderboardResponse
      const response = await apiGet<LeaderboardResponse['data']>(url);
      
      const leaderboardResponse: LeaderboardResponse = {
        success: response.success ?? true,
        message: response.message || 'Level leaderboard retrieved successfully',
        data: response.data!,
        timestamp: response.timestamp || new Date().toISOString(),
      };

      // Cache the response
      await this.setCachedData('LEVELS', leaderboardResponse);
      
      return leaderboardResponse;
    } catch (error: any) {
      console.error('[LeaderboardService] Error fetching levels leaderboard:', error);
      throw new Error(error.message || 'Failed to fetch levels leaderboard');
    }
  }

  /**
   * Get weekly streak leaderboard
   */
  static async getWeeklyStreakLeaderboard(useCache: boolean = true): Promise<LeaderboardResponse> {
    const url = buildURL('/api/gamification/leaderboards/weekly-streak');
    
    // Try cache first
    if (useCache) {
      const cached = await this.getCachedData('WEEKLY_STREAK');
      if (cached) return cached;
    }

    try {
      // The backend returns the full LeaderboardResponse structure
      // apiGet wraps it in ApiResponse, so response.data is the LeaderboardResponse
      const response = await apiGet<LeaderboardResponse['data']>(url);
      
      const leaderboardResponse: LeaderboardResponse = {
        success: response.success ?? true,
        message: response.message || 'Weekly streak leaderboard retrieved successfully',
        data: response.data!,
        timestamp: response.timestamp || new Date().toISOString(),
      };

      // Cache the response
      await this.setCachedData('WEEKLY_STREAK', leaderboardResponse);
      
      return leaderboardResponse;
    } catch (error: any) {
      console.error('[LeaderboardService] Error fetching weekly streak leaderboard:', error);
      throw new Error(error.message || 'Failed to fetch weekly streak leaderboard');
    }
  }

  /**
   * Get leaderboard by type
   */
  static async getLeaderboard(type: LeaderboardType, useCache: boolean = true): Promise<LeaderboardResponse> {
    switch (type) {
      case 'POINTS':
        return this.getPointsLeaderboard(useCache);
      case 'LEVELS':
        return this.getLevelsLeaderboard(useCache);
      case 'WEEKLY_STREAK':
        return this.getWeeklyStreakLeaderboard(useCache);
      default:
        throw new Error(`Unknown leaderboard type: ${type}`);
    }
  }
}
