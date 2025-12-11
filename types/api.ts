// types/api.ts
// Centralized types for all API services
// Single source of truth for data structures


// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  email?: string;
  uuidString: string;
  roles: string[];
  message?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  birthDate?: string;
  gender?: string;
  height?: number;
  initialWeight?: number;
  goalType?: string;
}

export interface RegisterResponse {   //full response from register endpoint - leave it if we will need this data for later
  userId: string;
  uuidString: string;
  username: string;
  email: string;
  birthDate: string;
  gender: string;
  height: number;
  initialWeight: number;
  goalType: string;
  userChampions: any[];
  userBadges: any[];
  roles: any[];
  currentStreak: number;
  totalExp: number;
  createdAt: string;
  updatedAt: string;
  admin: boolean;
}

// User Types
export interface User {
  id: number;
  email: string;
  username: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

// API Error Type - ADD THIS
export interface ApiError {
  success: boolean;
  error: string;
  message: string;
  path: string;
  status: number;
  timestamp: string;
  details?: any;
}

// Error Response Type
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  status: number;
  timestamp: string;
}


// Base API Response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
  status?: number;
}

// AI Recommendation Types
export type TrainingLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type WorkoutFrequency = 1 | 2 | 3 | 4 | 5 | 6;

export interface AiRecommendationRequest {
  frequency: WorkoutFrequency;
  lvlOfTraining: TrainingLevel;
}

export interface AiRecommendationResponse {
  suggestedWorkoutRoutine: string;
  routineId: string;
  description: string;
  difficultyLevel: string;
  workoutSplit: string;
}



// Exercise Types
export interface Exercise {
  id: string;
  externalId?: string;
  name: string;
  bodyPart?: string;
  equipment?: string;
  targetMuscle?: string;
  secondaryMuscles?: string[];
  instructions?: string[];
  description?: string;
  difficulty?: string;
  category?: string;
  keywords?: string[];
  imageUrl?: string;
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  usageCount?: number;
  active?: boolean;
}

// Planned Set Types
export interface PlannedSet {
  setNumber?: number;
  reps?: number;
  repRangeStart?: number;
  repRangeEnd?: number;
  weightKg?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  restSeconds?: number;
  type?: 'NORMAL' | 'WARMUP' | 'DROP' | 'FAILURE';
  notes?: string;
}

// Planned Exercise Types (for workout plans)
export interface PlannedExercise {
  id?: string;
  index?: number;
  title: string;
  name?: string;
  exerciseTemplateId: string;
  notes?: string;
  description?: string;
  instructions?: string;

  // ADDED: Metadata fields
  bodyPart?: string;
  equipment?: string;
  targetMuscle?: string;
  secondaryMuscles?: string[];
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category?: 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY' | 'SPORTS' | 'OTHER';

  sets: PlannedSet[];
  restSeconds?: number;
  supersetId?: string;
  targetSets?: number;
  targetReps?: number;
  restDurationSeconds?: number;
}

// Workout Plan Types
export interface WorkoutPlan {
  id: string;
  title: string;
  name?: string;
  folderId?: string;
  description?: string;
  exercises: PlannedExercise[];
  estimatedDurationMinutes?: number;
  estimatedDuration?: number;
  isPublic?: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
  exerciseCount?: number;
  difficulty?: string;
  targetMuscleGroups?: string[];
}

// Create Workout Plan Request DTO
export interface CreateWorkoutPlanRequest {
  title: string;
  description?: string;
  exercises?: PlannedExercise[];
  estimatedDurationMinutes?: number;
  isPublic?: boolean;
}

// Update Workout Plan Request DTO
export interface UpdateWorkoutPlanRequest {
  title?: string;
  description?: string;
  estimatedDurationMinutes?: number;
  isPublic?: boolean;
}

// Add Exercise to Workout Plan Request DTO
export interface AddExerciseToWorkoutPlanRequest {
  exerciseTemplateId: string;
  title: string;
  notes?: string;
  instructions?: string;
  sets: PlannedSet[];
  restSeconds?: number;
  bodyPart?: string;
  equipment?: string;
  targetMuscle?: string;
}

// Routine Folder Types
export interface RoutineFolder {
  id: string;
  hevyId?: number;
  title: string;
  name?: string;
  description?: string;
  difficultyLevel?: string;
  difficulty?: string;
  equipmentType?: string;
  workoutSplit?: string;
  duration?: string;
  imageUrl?: string;
  isPublic?: boolean;
  createdBy?: string | number;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
  folderIndex?: number;
  workoutPlanIds: string[];
  workoutPlans?: WorkoutPlan[];
  workoutPlanCount?: number;
  personal?: boolean;
}

// Save Routine Response
export interface SaveRoutineResponse {
  routineFolder: RoutineFolder;
  workoutPlans: WorkoutPlan[];
  message?: string;
}

// Workout Session Types
export interface WorkoutSet {
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  restSeconds: number | null;
  rpe: number | null;
  completed: boolean;
  notes: string | null;
  volume: number;
  setType: 'NORMAL' | 'WARMUP' | 'DROP' | 'FAILURE';
  startedAt: string | null;
  completedAt: string | null;
  personalRecords?: string[];
}

// Workout Exercise Types (for active workout sessions)
export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  exerciseOrder: number | null;
  exerciseCategory: string | null;
  primaryMuscleGroup: string | null;
  secondaryMuscleGroups: string[];
  equipment: string | null;

  // ADDED: Additional metadata fields
  bodyPart?: string | null;
  targetMuscle?: string | null;
  difficulty?: string | null;
  category?: string | null;
  description?: string | null;

  sets: WorkoutSet[];
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  totalVolume: number;
  totalReps: number;
  maxWeight: number;
  averageRpe: number;
  completedSets: number;
}

export interface WorkoutSession {
  id: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  exercises: WorkoutExercise[];
  metrics: {
    totalVolume: number;
    totalSets: number;
    totalReps: number;
    caloriesBurned: number;
    workedMuscleGroups: string[];
    personalRecordsAchieved: any | null;
  };
  context: {
    location: string | null;
    notes: string | null;
    rating: number | null;
    tags: string[];
  };
  userId: number;
  workoutName: string;
  workoutPlanId: string | null;
  workoutType: 'STRENGTH' | 'CARDIO' | 'HIIT' | 'FLEXIBILITY' | 'SPORTS' | 'OTHER';
  startedAt: string;
  completedAt: string | null;
  durationMinutes: number | null;
}

// Update Set Request DTO
export interface UpdateSetRequest {
  weightKg?: number | null;
  reps?: number | null;
  completed?: boolean;
  rpe?: number | null;
  notes?: string | null;
  durationSeconds?: number | null;
  distanceMeters?: number | null;
  restSeconds?: number | null;
  setType?: string;
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

// Add Exercise to Workout Plan Request DTO
export interface AddExerciseToWorkoutPlanRequest {
  exerciseTemplateId: string;
  title: string;
  notes?: string;
  instructions?: string;
  description?: string;

  // ADDED: Metadata fields
  bodyPart?: string;
  equipment?: string;
  targetMuscle?: string;
  secondaryMuscles?: string[];
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category?: 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY' | 'SPORTS' | 'OTHER';

  sets: PlannedSet[];
  restSeconds?: number;
}


// Add Exercise to Workout Session Request DTO
export interface AddExerciseToWorkoutSessionRequest {
  exerciseId: string;
  exerciseName: string;
  notes?: string;
  exerciseCategory?: string | null;
  primaryMuscleGroup?: string | null;
  secondaryMuscleGroups?: string[];
  equipment?: string | null;

  // ADDED: Denormalized metadata fields
  bodyPart?: string | null;
  targetMuscle?: string | null;
  difficulty?: string | null;
  category?: string | null;
  description?: string | null;

  sets?: {
    setNumber: number;
    setType: 'NORMAL' | 'WARMUP' | 'DROP' | 'FAILURE';
    weightKg?: number | null;
    reps?: number | null;
    durationSeconds?: number | null;
    distanceMeters?: number | null;
    restSeconds?: number | null;
    rpe?: number | null;
    notes?: string | null;
    completed: boolean;
  }[];
}
