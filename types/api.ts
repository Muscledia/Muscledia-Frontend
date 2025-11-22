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

// Routine Folder Types
export interface RoutineFolder {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  duration: string;
  imageUrl?: string;
  isPublic: boolean;
  createdBy: string;
  workoutPlanIds?: string[];
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