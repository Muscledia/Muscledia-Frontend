import { apiGet } from './api';
import { API_CONFIG, buildURL } from '@/config/api';
import { GamificationProfile, GamificationProfileResponse } from '@/types';

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
