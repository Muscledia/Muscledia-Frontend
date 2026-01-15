// types/gamification.types.ts
// Leaderboard, badges, challenges, and other gamification types

// Badge Types
export interface BadgeCatalogResponse {
  success: boolean;
  message: string;
  data: Badge[];
  timestamp: string;
}

export interface Badge {
  badgeId: string;
  name: string;
  description: string;
  badgeType: 'EXERCISE' | 'CHAMPION' | 'STREAK' | 'PR';
  imageUrl: string | null;
  pointsAwarded: number;
  criteriaType: 'WORKOUT_COUNT' | 'WORKOUT_DURATION' | 'WORKOUT_STREAK' | 'PERSONAL_RECORD' | 'LEVEL_REACHED' | 'EXERCISE_COUNT' | 'WEIGHT_LIFTED_TOTAL' | 'WEEKLY_WORKOUTS' | 'MONTHLY_WORKOUTS' | 'POINTS_EARNED' | 'LOGIN_STREAK';
  criteriaParams: {
    targetValue: number;
  };
  createdAt: string;
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
  badgeName: string;
  description: string;
  category: string;
  pointsAwarded: number;
}

export interface BadgeStatus extends Badge {
  isEarned: boolean;
  earnedAt?: string;
  progress?: number; // 0-100 for trackable badges
}

// Leaderboard Types
export type LeaderboardType = 'POINTS' | 'LEVELS' | 'WEEKLY_STREAK';

export interface LeaderboardEntry {
  userId: number;
  rank: number;
  points: number;
  level: number;
  username: string;
  displayName: string;
  currentStreak?: number;
  totalWorkouts: number;
  totalBadges: number;
  longestStreak?: number;
}

export interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUser: LeaderboardEntry;
  nearbyUsers: LeaderboardEntry[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalUsers: number;
  leaderboardType: LeaderboardType;
  currentUserInTopList: boolean;
}

export interface LeaderboardResponse {
  success: boolean;
  message: string;
  data: LeaderboardData;
  timestamp: string;
}

// Challenge Types
export type ChallengeType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type ChallengeStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'FAILED';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

/**
 * Matches backend ChallengeDto
 * Used for browsing available/recommended templates
 */
export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  category: string | null;
  difficultyLevel: DifficultyLevel;
  targetValue: number;
  progressUnit: string;
  currentProgress: number;
  completionPercentage: number;
  timeRemaining: string;
  rewardPoints: number;
  rewardCoins: number;
  experiencePoints: number;
  isMilestone: boolean;
  isLegendary: boolean;
  completionMessage: string;
  exerciseFocus: string[];
  safetyNote: string | null;
  tips: string[];
  prerequisites: string[];
  unlocks: string[];
}

/**
 * Matches backend UserChallengeDto
 * Used for active/completed participations
 */
export interface UserChallenge {
  challengeId: string; // Map from template ID for keys
  challengeName: string;
  description: string;
  challengeType: ChallengeType;
  difficultyLevel: string;
  status: ChallengeStatus;
  currentProgress: number;
  targetValue: number;
  progressUnit: string;
  progressPercentage: number;
  timeRemaining: string;
  isExpiringSoon: boolean;
  rewardPoints: number;
  rewardCoins: number;
  experiencePoints: number;
  pointsEarned: number;
  isNearCompletion: boolean;
  isMilestone: boolean;
  isLegendary: boolean;
  completionMessage: string;
  exerciseFocus: string[];
  safetyNote: string | null;
  tips: string[];
  unlocks: string[];
  statusColor: string; // e.g., 'green' | 'yellow' | 'blue' | 'red'
  progressColor: string; // Injected by backend based on percentage
}

export interface ChallengeCatalog {
  activeChallenges: UserChallenge[];
  availableChallenges: Record<string, Challenge[]>;
  recommendedChallenges: Challenge[];
  completedChallenges: UserChallenge[];
}

// Gamification Profile Types
export interface WorkoutStreak {
  current: number;
  lastUpdate: string | null;
  longest: number;
}

export interface GamificationProfile {
  id: string;
  userId: number;
  points: number;
  fitnessCoins: number;
  username: string;
  level: number;
  lastLevelUpDate: string;
  streaks: {
    workout: WorkoutStreak;
  };
  earnedBadges: EarnedBadge[];
  quests: Array<{
    questId: string;
    objectiveProgress: number;
    status: string;
    startDate: string;
    completionDate: string | null;
    createdAt: string;
  }>;
  totalWorkoutsCompleted: number;
  lastWorkoutDate: string | null;
  weeklyStreak: number;
  longestWeeklyStreak: number;
  currentWeekStartDate: string;
  monthlyStreak: number;
  longestMonthlyStreak: number;
  currentMonthStartDate: string;
  restDaysSinceLastWorkout: number;
  profileCreatedAt: string;
  lastUpdated: string;
}

export interface GamificationProfileResponse {
  success: boolean;
  message: string;
  data: GamificationProfile;
  timestamp: string;
}
