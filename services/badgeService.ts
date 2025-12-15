import { apiGet } from './api';
import { API_CONFIG, buildURL } from '@/config/api';
import { Badge, BadgeStatus } from '@/types/api';

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

/**
 * BadgeService
 * Handles badge related calls to an API.
 */
export class BadgeService {
  private static readonly BADGES_TTL = 15 * 60 * 1000; // 15 minutes
  private static readonly USER_BADGES_TTL = 5 * 60 * 1000; // 5 minutes

  private static badgesCache?: CacheEntry<Badge[]>;
  private static userBadgesCache?: CacheEntry<Badge[]>;

  /**
   * Fetch the complete badge catalog from /api/badges (cached for 15 minutes).
   */
  static async getAllBadges(forceRefresh = false): Promise<Badge[]> {
    if (!forceRefresh && this.isCacheValid(this.badgesCache)) {
      return this.badgesCache!.value;
    }

    const url = buildURL('/api/badges');

    try {
      const response = await apiGet<Badge[]>(url, {
        timeout: API_CONFIG.REQUEST.TIMEOUT,
      });

      const badges = response.data ?? [];
      this.badgesCache = this.buildCacheEntry(badges, this.BADGES_TTL);
      return badges;
    } catch (error) {
      console.error('Failed to fetch badge catalog:', error);

      if (this.isCacheValid(this.badgesCache)) {
        return this.badgesCache!.value;
      }

      throw error;
    }
  }

  /**
   * Fetch user's badges from /api/badges/my-badges (cached for 15 minutes).
   */
  static async getUserBadges(forceRefresh = false): Promise<Badge[]> {
    if (!forceRefresh && this.isCacheValid(this.userBadgesCache)) {
      return this.userBadgesCache!.value;
    }

    const url = buildURL('/api/badges/my-badges');

    try {
      const response = await apiGet<Badge[]>(url, {
        timeout: API_CONFIG.REQUEST.TIMEOUT,
      });

      const badges = response.data ?? [];
      this.userBadgesCache = this.buildCacheEntry(badges, this.USER_BADGES_TTL);
      return badges;
    } catch (error) {
      console.error('Failed to fetch user badges:', error);
      if (this.isCacheValid(this.userBadgesCache)) {
        return this.userBadgesCache!.value;
      }
      throw error;
    }
  }

  /**
   * Combine catalog and owned badge data into a badge status view model.
   * Uses only badge endpoints:
   *  - /api/badges           → full badge catalog
   *  - /api/badges/my-badges → badges owned by current user
   */
  static async getBadgeStatus(
    forceRefresh = false
  ): Promise<BadgeStatus[]> {
    const [allBadges, userBadges] = await Promise.all([
      this.getAllBadges(forceRefresh),
      this.getUserBadges(forceRefresh),
    ]);

    const ownedIds = new Set((userBadges ?? []).map((b) => b.badgeId));

    return allBadges.map((badge) => {
      const isEarned = ownedIds.has(badge.badgeId);

      return {
        ...badge,
        isEarned,
        // /api/badges/my-badges currently does not expose earnedAt;
        // this can be wired up later when backend provides it.
        earnedAt: undefined,
        progress: this.getBadgeProgress(badge),
      };
    });
  }

  /**
   * Calculate badge progress using only badge definition data.
   *
   * Since user‑specific stats (workouts, points, streaks, etc.) are not
   * available from the badge endpoints, we can only infer completion for
   * badges that have a zero target (e.g. auto‑awarded WELCOME badges).
   * For all other criteria, progress is left undefined for now.
   */
  static getBadgeProgress(
    badge: Badge
  ): number | undefined {
    const target = badge.criteriaParams?.targetValue ?? 0;

    // If the badge has no meaningful target, treat it as fully attainable.
    if (target <= 0) {
      return 100;
    }

    // Without user‑specific metrics from a stats/leaderboard API,
    // we cannot calculate partial progress yet.
    return undefined;
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
