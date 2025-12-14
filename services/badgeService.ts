import { apiGet } from './api';
import { API_CONFIG, buildURL } from '@/config/api';
import { Badge, EarnedBadge, BadgeStatus } from '@/types/api';

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

type LeaderboardUser = {
  userId: string | number;
  earnedBadges?: EarnedBadge[];
  totalWorkoutsCompleted?: number;
  totalWorkouts?: number;
  totalWorkoutDurationMinutes?: number;
  // Allow passthrough of any additional leaderboard metrics without tight coupling
  [key: string]: any;
};

type LeaderboardResponse = {
  leaderboard: LeaderboardUser[];
  currentUser: LeaderboardUser;
  nearbyUsers: LeaderboardUser[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalUsers: number;
  leaderboardType: string;
  currentUserInTopList: boolean;
};

type EarnedBadgesResult = {
  badges: EarnedBadge[];
  userProfile?: LeaderboardUser;
};

/**
 * BadgeService
 * Handles badge related calls to an API.
 */
export class BadgeService {
  private static readonly BADGES_TTL = 15 * 60 * 1000; // 15 minutes
  private static readonly EARNED_TTL = 5 * 60 * 1000; // 5 minutes

  private static badgesCache?: CacheEntry<Badge[]>;
  private static earnedCache: Map<string | number, CacheEntry<EarnedBadgesResult>> = new Map();

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
   * Fetch earned badges for the current user from the leaderboard (cached for 5 minutes).
   */
  static async getUserEarnedBadges(
    currentUserId: string | number,
    forceRefresh = false
  ): Promise<EarnedBadgesResult> {
    const cached = this.earnedCache.get(currentUserId);
    if (!forceRefresh && this.isCacheValid(cached)) {
      return cached!.value;
    }

    const url = buildURL('/api/gamification/leaderboards/points');

    try {
      const response = await apiGet<LeaderboardResponse>(url, {
        timeout: API_CONFIG.REQUEST.TIMEOUT,
      });

      // Parse the leaderboard response structure
      const leaderboardData = response.data;
      const userProfile = leaderboardData?.currentUser;

      // Get earned badges from currentUser or find in leaderboard
      const earnedBadges = userProfile?.earnedBadges ?? [];
      
      // Use totalWorkouts if totalWorkoutsCompleted is not available
      if (userProfile && !userProfile.totalWorkoutsCompleted && userProfile.totalWorkouts !== undefined) {
        userProfile.totalWorkoutsCompleted = userProfile.totalWorkouts;
      }

      const result: EarnedBadgesResult = {
        badges: earnedBadges,
        userProfile,
      };

      this.earnedCache.set(
        currentUserId,
        this.buildCacheEntry(result, this.EARNED_TTL)
      );

      return result;
    } catch (error) {
      console.error('Failed to fetch earned badges:', error);

      if (this.isCacheValid(cached)) {
        return cached!.value;
      }

      throw error;
    }
  }

  /**
   * Combine catalog and earned data into a badge status view model.
   */
  static async getBadgeStatus(
    currentUserId: string | number,
    forceRefresh = false
  ): Promise<BadgeStatus[]> {
    const [allBadges, earnedResult] = await Promise.all([
      this.getAllBadges(forceRefresh),
      this.getUserEarnedBadges(currentUserId, forceRefresh),
    ]);

    const { badges: earnedBadges, userProfile } = earnedResult;

    return allBadges.map((badge) => {
      const earned = earnedBadges.find((eb) => eb.badgeId === badge.badgeId);

      return {
        ...badge,
        isEarned: Boolean(earned),
        earnedAt: earned?.earnedAt,
        progress: this.getBadgeProgress(badge, userProfile),
      };
    });
  }

  /**
   * Calculate badge progress based on available user stats.
   */
  static getBadgeProgress(
    badge: Badge,
    userProfile?: LeaderboardUser
  ): number | undefined {
    if (!userProfile) {
      return undefined;
    }

    switch (badge.criteriaType) {
      case 'WORKOUT_COUNT': {
        const current = userProfile.totalWorkoutsCompleted ?? userProfile.totalWorkouts ?? 0;
        const target = badge.criteriaParams?.targetValue ?? 0;

        if (target <= 0) {
          return 100;
        }

        return Math.min(100, (current / target) * 100);
      }

      case 'WORKOUT_DURATION': {
        const current = userProfile.totalWorkoutDurationMinutes ?? 0;
        const target = badge.criteriaParams?.targetValue ?? 0;

        if (target <= 0) {
          return 100;
        }

        return Math.min(100, (current / target) * 100);
      }

      case 'WORKOUT_STREAK':
      case 'LOGIN_STREAK': {
        // Would need streak data from user profile
        return undefined;
      }

      case 'PERSONAL_RECORD': {
        // Would need PR count from user profile
        return undefined;
      }

      case 'LEVEL_REACHED': {
        const current = userProfile.level ?? 0;
        const target = badge.criteriaParams?.targetValue ?? 0;

        if (target <= 0) {
          return 100;
        }

        return Math.min(100, (current / target) * 100);
      }

      case 'EXERCISE_COUNT':
      case 'WEIGHT_LIFTED_TOTAL':
      case 'WEEKLY_WORKOUTS':
      case 'MONTHLY_WORKOUTS':
      case 'POINTS_EARNED': {
        // Would need specific data from user profile
        return undefined;
      }

      default:
        return undefined;
    }
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
