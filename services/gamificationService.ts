import { apiGet, apiPost } from './api';
import { API_CONFIG, buildURL } from '@/config/api';
import { GamificationProfile, GamificationProfileResponse, ApiResponse } from '@/types';

export interface StreakInfo {
  restDaysSinceLastWorkout: number;
  monthly: {
    currentStreak: number;
    longestStreak: number;
    periodStart: string;
  };
  weekly: {
    currentStreak: number;
    longestStreak: number;
    periodStart: string;
  };
  lastWorkoutDate: string;
}
export interface CoinBalanceResponse {
  currentBalance: number;
  lifetimeEarned: number;
}

export interface CoinTransactionResponse {
  success: boolean;
  transactionType: 'SPEND' | 'EARN';
  amount: number;
  itemId: string;
  newBalance: number;
  timestamp: string;
}


type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

/**
 * GamificationService
 * Handles gamification profile related calls to an API.
 */
export class GamificationService {
  private static readonly PROFILE_TTL = 5 * 60 * 1000; // 5 minutes

  private static profileCache?: CacheEntry<GamificationProfile>;

  /**
   * Fetch the user's gamification profile from /api/gamification/profile (cached for 5 minutes).
   */
  static async getProfile(forceRefresh = false): Promise<GamificationProfile> {
    if (!forceRefresh && this.isCacheValid(this.profileCache)) {
      return this.profileCache!.value;
    }

    const url = buildURL('/api/gamification/profile');

    try {
      const response = await apiGet<GamificationProfile>(url, {
        timeout: API_CONFIG.REQUEST.TIMEOUT,
      });

      const profile = response.data!;
      this.profileCache = this.buildCacheEntry(profile, this.PROFILE_TTL);
      return profile;
    } catch (error) {
      console.error('Failed to fetch gamification profile:', error);

      if (this.isCacheValid(this.profileCache)) {
        return this.profileCache!.value;
      }

      throw error;
    }
  }

  /**
   * Get streak information from /api/gamification/streaks
   */
  static async getStreaks(): Promise<ApiResponse<StreakInfo>> {
    const url = buildURL('/api/gamification/streaks');

    try {
      const response = await apiGet<StreakInfo>(url, {
        timeout: API_CONFIG.REQUEST.TIMEOUT,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch streaks:', error);
      throw error;
    }
  }

  /**
   * Get coin balance from /api/gamification/coins/balance
   */
  static async getCoinBalance(): Promise<ApiResponse<CoinBalanceResponse>> {
    const url = buildURL('/api/gamification/coins/balance');

    try {
      const response = await apiGet<CoinBalanceResponse>(url, {
        timeout: API_CONFIG.REQUEST.TIMEOUT,
      });

      // Clear profile cache since balance changed
      this.clearCache();

      return response;
    } catch (error) {
      console.error('Failed to fetch coin balance:', error);
      throw error;
    }
  }

  /**
   * Spend coins for a purchase
   */
  static async spendCoins(amount: number, itemId: string): Promise<ApiResponse<CoinTransactionResponse>> {
    const url = buildURL('/api/gamification/coins/spend');

    try {
      const response = await apiPost<CoinTransactionResponse>(url, {
        amount,
        itemId,
      }, {
        timeout: API_CONFIG.REQUEST.TIMEOUT,
      });

      // Clear profile cache since balance changed
      this.clearCache();

      return response;
    } catch (error) {
      console.error('Failed to spend coins:', error);
      throw error;
    }
  }

  /**
   * Clear the profile cache
   */
  static clearCache(): void {
    this.profileCache = undefined;
  }

  private static isCacheValid<T>(entry?: CacheEntry<T>): entry is CacheEntry<T> {
    return !!entry && entry.expiresAt > Date.now();
  }

  private static buildCacheEntry<T>(value: T, ttl: number): CacheEntry<T> {
    return {
      value,
      expiresAt: Date.now() + ttl,
    };
  }
}
