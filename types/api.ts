// types/api.ts

// API Response Types matching Spring Boot backend

// Common API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  userId: string;
  uuidString: string;
  roles: string[];
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  birthDate: string;
  gender: string;
  height: number;
  initialWeight: number;
  goalType: 'BUILD_STRENGTH' | 'LOSE_WEIGHT' | 'MAINTAIN' | 'BUILD_MUSCLE';
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  birthDate: string;
  gender: string;
  height: number;
  weight: number;
  goalType: string;
  createdAt: string;
  updatedAt: string;
}

// Challenge Types (Backend definitions)
export type JourneyPhase = 'Foundation' | 'Building' | 'Mastery';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  objective: string;
  targetValue: number;
  rewardPoints: number;
  unlockedQuestId?: string;
  difficulty: string;
  autoEnroll: boolean;
  startDate: string;
  endDate: string;
  progressUnit: string;
  formattedTarget: string;
  estimatedDuration: string;
  alreadyStarted: boolean;
  active: boolean;
}

export interface ActiveChallenge {
  id: string;
  challengeId: string;
  challengeName: string;
  challengeType: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  currentProgress: number;
  targetValue: number;
  progressPercentage: number;
  progressUnit: string;
  startedAt: string;
  completedAt?: string;
  expiresAt: string;
  pointsEarned: number;
  statusDisplayName: string;
  formattedProgress: string;
  timeRemaining: string;
  canComplete: boolean;
  completionMessage?: string;
}

// ============================================
// ROUTINE FOLDER & WORKOUT PLAN TYPES
// ============================================

/**
 * Routine Folder - Enriched response includes embedded workout plans
 */
export interface RoutineFolder {
  id: string;
  hevyId?: number;
  title: string;
  name: string; // Alias for title (for backward compatibility)
  description: string;
  difficultyLevel?: string;
  difficulty: string; // Normalized field
  equipmentType?: string;
  workoutSplit?: string;
  duration: string;
  imageUrl?: string;
  isPublic: boolean;
  createdBy: number | string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  workoutPlanIds: string[];
  workoutPlans: WorkoutPlan[]; // Embedded workout plans
  workoutPlanCount: number;
  personal: boolean;
  folderIndex?: number;
}

/**
 * Workout Plan - Matches backend structure with embedded exercises
 */
export interface WorkoutPlan {
  id: string;
  title: string;
  name: string; // Alias for title (for backward compatibility)
  folderId?: string;
  description?: string;
  exercises: PlannedExercise[]; // Embedded exercises
  estimatedDurationMinutes?: number;
  estimatedDuration: number; // Normalized field
  isPublic: boolean;
  createdBy: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;

  // Computed fields for UI
  exerciseCount: number;
  difficulty?: string;
  targetMuscleGroups?: string[];
}

/**
 * Planned Exercise - Exercise within a workout plan
 */
export interface PlannedExercise {
  index: number;
  title: string;
  name: string; // Alias for title
  notes?: string;
  exerciseTemplateId: string;
  supersetId?: string | null;
  restSeconds: number;
  sets: PlannedSet[];
}

/**
 * Planned Set - Individual set configuration
 */
export interface PlannedSet {
  index: number;
  type: string;
  weightKg?: number | null;
  reps?: number | null;
  distanceMeters?: number | null;
  durationSeconds?: number | null;
  repRangeStart?: number | null;
  repRangeEnd?: number | null;
  repRangeString?: string | null;
  effectiveReps: string;
}

// ============================================
// EXERCISE TYPES (for Exercise Library)
// ============================================

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: string;
  imageUrl?: string;
  videoUrl?: string;
  sets?: number;
  reps?: number;
  restTime?: number;
}

// Workout Plan Detail (simplified - exercises are always PlannedExercise now)
export interface WorkoutPlanDetail extends WorkoutPlan {
  instructions?: string;
}

// ============================================
// SAVE ROUTINE TYPES
// ============================================

export interface SaveRoutineRequest {
  publicRoutineId: string;
}

export interface SaveRoutineResponse {
  routineFolder: RoutineFolder;
  workoutPlans: WorkoutPlan[];
  message: string;
}

// ============================================
// ERROR TYPES
// ============================================

export interface ApiError {
  success: false;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  status: number;
}
