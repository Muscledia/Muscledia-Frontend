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


// Domain types

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



//Other types here

// Challenge Types (Backend definitions)
export type JourneyPhase = 'Foundation' | 'Building' | 'Mastery';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string; // e.g., 'DAILY', 'WEEKLY' or specific types
  objective: string;
  targetValue: number;
  rewardPoints: number;
  unlockedQuestId?: string;
  difficulty: string; // 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'
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
  id: string; // instance id
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


// Routine Folder Types
export interface RoutineFolder {
  id: string;
  hevyId?: number;
  folderIndex?: number;
  title: string;
  workoutPlanIds?: string[];
  difficultyLevel: string;
  equipmentType: string;
  workoutSplit: string;
  isPublic: boolean;
  createdBy: string;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
  workoutPlanCount?: number;
  personal?: boolean;
  workoutPlans?: WorkoutPlan[];
  
  // Deprecated/Frontend compatibility fields (optional)
  name?: string; 
  description?: string;
  duration?: string;
  imageUrl?: string;
  difficulty?: string;
}

// Workout Plan Types
export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  targetMuscleGroups: string[];
  estimatedDuration: number;
  difficulty: string;
  exerciseCount: number;
}

// Exercise Types
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

// Workout Plan Detail (includes exercises)
export interface WorkoutPlanDetail extends WorkoutPlan {
  exercises: Exercise[];
  instructions?: string;
}

// Save Routine Types
export interface SaveRoutineRequest {
  publicRoutineId: string;
}

export interface SaveRoutineResponse {
  routineFolder: RoutineFolder;
  workoutPlans: WorkoutPlan[];
  message: string;
}

// Error Types
export interface ApiError {
  success: false;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  status: number;
}
