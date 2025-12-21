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
export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'DAILY' | 'WEEKLY';
  points: number;
  requirements: unknown;
}

export interface ActiveChallenge {
  id: string;
  challengeId: string;
  userId: number;
  progress: number;
  completed: boolean;
  completedAt?: string;
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
