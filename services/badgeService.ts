import { apiGet } from './api';
import { API_CONFIG, buildURL } from '@/config/api';
import { Badge, BadgeStatus, GamificationProfile } from '@/types';
import { GamificationService } from './gamificationService';

/**
 * BadgeService
 * Handles badge related calls to an API.
 * Caching is now handled by React Query in the useBadges hook
 */
export class BadgeService {
  /**
   * Fetch the complete badge catalog from /api/badges
   * Caching is now handled by React Query in the useBadgeCatalog hook
   */
  static async getAllBadges(): Promise<Badge[]> {
    const url = buildURL('/api/badges');

    try {
      const response = await apiGet<Badge[]>(url, {
        timeout: API_CONFIG.REQUEST.TIMEOUT,
      });

      return response.data ?? [];
    } catch (error) {
      console.error('Failed to fetch badge catalog:', error);
      throw error;
    }
  }

  /**
   * Fetch user's badges from /api/badges/my-badges
   * Caching is now handled by React Query in the useUserBadges hook
   */
  static async getUserBadges(): Promise<Badge[]> {
    const url = buildURL('/api/badges/my-badges');

    try {
      const response = await apiGet<Badge[]>(url, {
        timeout: API_CONFIG.REQUEST.TIMEOUT,
      });

      return response.data ?? [];
    } catch (error) {
      console.error('Failed to fetch user badges:', error);
      throw error;
    }
  }

  /**
   * Combine catalog and owned badge data into a badge status view model.
   * Uses badge endpoints and gamification profile:
   *  - /api/badges                → full badge catalog
   *  - /api/badges/my-badges      → badges owned by current user
   *  - /api/gamification/profile  → user stats for progress calculation
   * Caching is now handled by React Query in the useBadgeStatus hook
   */
  static async getBadgeStatus(): Promise<BadgeStatus[]> {
    const [allBadges, userBadges, profile] = await Promise.all([
      this.getAllBadges(),
      this.getUserBadges(),
      GamificationService.getProfile().catch(() => null), // Don't fail if profile fetch fails
    ]);

    const ownedIds = new Set((userBadges ?? []).map((b) => b.badgeId));
    
    // Create a map of badgeId -> earnedAt from profile's earnedBadges
    const earnedBadgesMap = new Map<string, string>();
    if (profile?.earnedBadges) {
      profile.earnedBadges.forEach((earnedBadge) => {
        earnedBadgesMap.set(earnedBadge.badgeId, earnedBadge.earnedAt);
      });
    }

    return allBadges.map((badge) => {
      const isEarned = ownedIds.has(badge.badgeId);

      return {
        ...badge,
        isEarned,
        earnedAt: earnedBadgesMap.get(badge.badgeId),
        progress: this.getBadgeProgress(badge, profile),
      };
    });
  }

  /**
   * Calculate badge progress based on badge criteria and user profile stats.
   * Supports progress calculation for:
   *  - WORKOUT_COUNT: Uses totalWorkoutsCompleted
   *  - LEVEL_REACHED: Uses level
   *  - WORKOUT_STREAK: Uses streaks.workout.current
   *  - POINTS_EARNED: Uses points
   */
  static getBadgeProgress(
    badge: Badge,
    profile: GamificationProfile | null
  ): number | undefined {
    const target = badge.criteriaParams?.targetValue ?? 0;

    // If the badge has no meaningful target, treat it as fully attainable.
    if (target <= 0) {
      return 100;
    }

    // If no profile data is available, return undefined
    if (!profile) {
      return undefined;
    }

    let currentValue: number;

    switch (badge.criteriaType) {
      case 'WORKOUT_COUNT':
        currentValue = profile.totalWorkoutsCompleted ?? 0;
        break;
      case 'LEVEL_REACHED':
        currentValue = profile.level ?? 0;
        break;
      case 'WORKOUT_STREAK':
        currentValue = profile.streaks?.workout?.current ?? 0;
        break;
      case 'POINTS_EARNED':
        currentValue = profile.points ?? 0;
        break;
      default:
        // For other criteria types, we don't have the data yet
        return undefined;
    }

    // Calculate progress percentage (capped at 100%)
    const progress = Math.min(100, Math.round((currentValue / target) * 100));
    return progress;
  }
}
