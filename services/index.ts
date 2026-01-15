// services/index.ts
// Centralized exports for all services and types
// Single import location for all service dependencies

// Services
export { AuthService } from './authService';
export { UserService } from './userService';
export { RoutineService } from './routineService';
export { WorkoutPlanService } from './workoutPlanService';
export { WorkoutService } from './WorkoutService';
export { ExerciseService } from './exerciseService';
export { ChallengeService } from './challengeService';
export { AiService } from './aiService';
export { BadgeService } from './badgeService';
export { LeaderboardService } from './leaderboardService';
export { GamificationService } from './gamificationService';

// Types and DTOs
export type {
  ApiResponse,
  User,
  Exercise,
  PlannedSet,
  PlannedExercise,
  WorkoutPlan,
  CreateWorkoutPlanRequest,
  UpdateWorkoutPlanRequest,
  AddExerciseToWorkoutPlanRequest,
  RoutineFolder,
  SaveRoutineResponse,
  WorkoutSet,
  WorkoutExercise,
  WorkoutSession,
  UpdateSetRequest,
  Challenge,
  ActiveChallenge,
  UserChallenge,
} from '@/types';

// API Client exports
export {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  getApiClient,
  initializeApiClient,
  setAuthToken,
  clearAuthToken,
} from './api';

// Workout Service exports (enums and specialized types)
export { SetType } from './WorkoutService';
