// services/WorkoutService.ts

import { apiDelete, apiGet, apiPost, apiPut } from './api';
import { ApiResponse } from '@/types/api';

/**
 * Set type classification for training intensity tracking
 */
export enum SetType {
  NORMAL = 'NORMAL',
  WARMUP = 'WARMUP',
  FAILURE = 'FAILURE',
  DROP = 'DROP',
}

/**
 * Workout data structures matching backend
 */
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

export interface WorkoutExercise {
  equipment: string | null;
  sets: WorkoutSet[];
  notes: string | null;
  exerciseId: string;
  exerciseName: string;
  exerciseOrder: number | null;
  exerciseCategory: string | null;
  primaryMuscleGroup: string | null;
  secondaryMuscleGroups: string[];
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

export interface UpdateSetRequest {
  weightKg?: number | null;
  reps?: number | null;
  completed?: boolean;
  rpe?: number | null;
  notes?: string | null;
  durationSeconds?: number | null;
  distanceMeters?: number | null;
  restSeconds?: number | null;
  setType?: SetType | string;
}

/**
 * Workout Service
 * Handles all workout session API calls
 */
export class WorkoutService {
  /**
   * Start a workout from a saved plan
   */
  static async startWorkoutFromPlan(planId: string): Promise<ApiResponse<WorkoutSession>> {
    const response = await apiPost<WorkoutSession>(`/api/v1/workouts/from-plan/${planId}`);
    return response;
  }

  /**
   * Start an empty workout session
   */
  static async startEmptyWorkout(workoutName: string): Promise<ApiResponse<WorkoutSession>> {
    const response = await apiPost<WorkoutSession>('/api/v1/workouts', {
      workoutName,
      workoutType: 'STRENGTH'
    });
    return response;
  }

  /**
   * Get active workout session
   */
  static async getWorkoutSession(workoutId: string): Promise<ApiResponse<WorkoutSession>> {
    const response = await apiGet<WorkoutSession>(`/api/v1/workouts/${workoutId}`);
    return response;
  }

  /**
   * Update a specific set in the workout
   * Backend returns the full workout session
   */
  static async updateSet(
    workoutId: string,
    exerciseIndex: number,
    setIndex: number,
    setData: UpdateSetRequest
  ): Promise<ApiResponse<WorkoutSession>> {
    const response = await apiPut<WorkoutSession>(
      `/api/v1/workouts/${workoutId}/exercises/${exerciseIndex}/sets/${setIndex}`,
      setData
    );
    return response;
  }

  /**
   * Add a new exercise to active workout
   */
  static async addExercise(
    workoutId: string,
    exerciseData: {
      exerciseId: string;
      exerciseName: string;
      notes?: string;
    }
  ): Promise<ApiResponse<WorkoutExercise>> {
    const response = await apiPost<WorkoutExercise>(
      `/api/v1/workouts/${workoutId}/exercises`,
      exerciseData
    );
    return response;
  }

  /**
   * Add a new set to an exercise
   */
  static async addSet(
    workoutId: string,
    exerciseIndex: number
  ): Promise<ApiResponse<WorkoutSet | WorkoutSession>> {
    const response = await apiPost<WorkoutSet | WorkoutSession>(
      `/api/v1/workouts/${workoutId}/exercises/${exerciseIndex}/sets`
    );
    return response;
  }

  /**
   * Complete the workout session
   */
  static async completeWorkout(workoutId: string): Promise<ApiResponse<WorkoutSession>> {
    const response = await apiPut<WorkoutSession>(
      `/api/v1/workouts/${workoutId}/complete`,
      {}
    );
    return response;
  }

  /**
   * Cancel the workout session
   */
  static async cancelWorkout(workoutId: string): Promise<ApiResponse<WorkoutSession>> {
    const response = await apiPut<WorkoutSession>(
      `/api/v1/workouts/${workoutId}/cancel`,
      {}
    );
    return response;
  }

  /**
   * Delete a set from an exercise during workout
   */
  static async deleteSet(
    workoutId: string,
    exerciseIndex: number,
    setIndex: number
  ): Promise<ApiResponse<WorkoutSession>> {
    const response = await apiDelete<WorkoutSession>(
      `/api/v1/workouts/${workoutId}/exercises/${exerciseIndex}/sets/${setIndex}`
    );
    return response;
  }

  /**
   * Delete an exercise from workout
   */
  static async deleteExercise(
    workoutId: string,
    exerciseIndex: number
  ): Promise<ApiResponse<WorkoutSession>> {
    const response = await apiDelete<WorkoutSession>(
      `/api/v1/workouts/${workoutId}/exercises/${exerciseIndex}`
    );
    return response;
  }

  /**
   * Add exercise to active workout
   */
  static async addExerciseToWorkout(
    workoutId: string,
    exerciseData: {
      exerciseId: string;
      exerciseName: string;
      notes?: string;
    }
  ): Promise<ApiResponse<WorkoutSession>> {
    const response = await apiPost<WorkoutSession>(
      `/api/v1/workouts/${workoutId}/exercises`,
      exerciseData
    );
    return response;
  }
}
