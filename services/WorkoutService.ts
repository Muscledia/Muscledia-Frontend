// services/WorkoutService.ts

import { apiDelete, apiGet, apiPost, apiPut } from './api';
import { ApiResponse } from '@/types';

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
    personalRecordsAchieved: number; // Count of total PRs
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

export interface CompleteWorkoutRequest {
  completedAt?: string;
  rating?: number;
  notes?: string;
  caloriesBurned?: number;
  additionalTags?: string[];
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
    console.log('Starting workout from plan:', planId);
    const response = await apiPost<WorkoutSession>(`/api/v1/workouts/from-plan/${planId}`, {});
    return response;
  }

  /**
   * Start an empty workout session
   */
  static async startEmptyWorkout(params: {
    workoutName: string;
    workoutType: string;
    location?: string;
    notes?: string;
    tags?: string[];
  }): Promise<ApiResponse<WorkoutSession>> {
    console.log('Starting empty workout:', params.workoutName);
    const response = await apiPost<WorkoutSession>('/api/v1/workouts', {
      workoutName: params.workoutName,
      workoutType: params.workoutType,
      location: params.location,
      notes: params.notes || '',
      tags: params.tags || [],
      useWorkoutPlan: false
    });
    return response;
  }

  /**
   * Get active workout session
   */
  static async getWorkoutSession(workoutId: string): Promise<ApiResponse<WorkoutSession>> {
    console.log('Fetching workout session:', workoutId);
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
    console.log(`Updating set: workout=${workoutId}, exercise=${exerciseIndex}, set=${setIndex}`, setData);

    const response = await apiPut<WorkoutSession>(
      `/api/v1/workouts/${workoutId}/exercises/${exerciseIndex}/sets/${setIndex}`,
      setData
    );
    return response;
  }

  /**
   * Add exercise to active workout session (alias with correct signature)
   */
  static async addExerciseToSession(
    workoutId: string,
    exercise: {
      exerciseId: string;
      exerciseName: string;
      notes?: string;
      bodyPart?: string;
      equipment?: string;
      targetMuscle?: string;
      secondaryMuscles?: string[];
      difficulty?: string;
      category?: string;
      description?: string;
      sets?: any[];
    }
  ): Promise<ApiResponse<WorkoutSession>> {
    return this.addExercise(workoutId, exercise);
  }

  /**
   * Add a new exercise to active workout
   */
  static async addExercise(
    workoutId: string,
    exercise: {
      exerciseId: string;
      exerciseName: string;
      notes?: string;
      bodyPart?: string;
      equipment?: string;
      targetMuscle?: string;
      secondaryMuscles?: string[];
      difficulty?: string;
      category?: string;
      description?: string;
      sets?: any[];
    }
  ): Promise<ApiResponse<WorkoutSession>> {
    try {
      const payload = {
        // Required fields
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,

        // Optional metadata
        notes: exercise.notes || '',
        exerciseCategory: exercise.category || null,
        primaryMuscleGroup: exercise.targetMuscle || null,
        secondaryMuscleGroups: exercise.secondaryMuscles || [],
        equipment: exercise.equipment || null,

        // Additional denormalized fields
        bodyPart: exercise.bodyPart || null,
        targetMuscle: exercise.targetMuscle || null,
        difficulty: exercise.difficulty || null,
        category: exercise.category || null,
        description: exercise.description || null,

        // Sets (ensure proper structure)
        sets: (exercise.sets || []).map((set, index) => ({
          setNumber: index + 1,
          setType: set.type || set.setType || 'NORMAL',
          weightKg: set.weightKg !== undefined ? set.weightKg : null,
          reps: set.reps !== undefined ? set.reps : null,
          durationSeconds: set.durationSeconds !== undefined ? set.durationSeconds : null,
          distanceMeters: set.distanceMeters !== undefined ? set.distanceMeters : null,
          restSeconds: set.restSeconds !== undefined ? set.restSeconds : null,
          rpe: set.rpe !== undefined ? set.rpe : null,
          notes: set.notes || null,
          completed: false, // Always start incomplete
        })),
      };

      console.log('Adding exercise to workout session:', workoutId);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await apiPost<WorkoutSession>(
        `/api/v1/workouts/${workoutId}/exercises`,
        payload
      );

      console.log('Exercise added to session successfully');
      return response;
    } catch (error: any) {
      console.error('Failed to add exercise to workout session:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Add a new set to an exercise
   * FIXED: Now ensures new sets start with completed: false
   */
  static async addSet(
    workoutId: string,
    exerciseIndex: number,
    initialSetData?: Partial<UpdateSetRequest>
  ): Promise<ApiResponse<WorkoutSession>> {
    console.log(`Adding set: workout=${workoutId}, exercise=${exerciseIndex}`);

    // Ensure the new set starts incomplete
    const setPayload = {
      ...initialSetData,
      completed: false, // Always start incomplete
      setType: initialSetData?.setType || 'NORMAL',
    };

    console.log('New set payload:', setPayload);

    const response = await apiPost<WorkoutSession>(
      `/api/v1/workouts/${workoutId}/exercises/${exerciseIndex}/sets`,
      setPayload
    );
    return response;
  }

  /**
   * Update set type during workout session
   * This is called when user changes set type in the UI
   */
  static async updateSetType(
    workoutId: string,
    exerciseIndex: number,
    setIndex: number,
    setType: SetType | string
  ): Promise<ApiResponse<WorkoutSession>> {
    console.log(`Updating set type: workout=${workoutId}, exercise=${exerciseIndex}, set=${setIndex}, type=${setType}`);

    return this.updateSet(workoutId, exerciseIndex, setIndex, { setType });
  }

  /**
   * Complete the workout session with proper request body
   */
  static async completeWorkout(
    workoutId: string,
    data?: {
      rating?: number;
      notes?: string;
      caloriesBurned?: number;
      location?: string;
    }
  ): Promise<ApiResponse<WorkoutSession>> {
    console.log('=== COMPLETING WORKOUT ===');
    console.log('Workout ID:', workoutId);
    console.log('Completion data:', data);

    const requestBody: CompleteWorkoutRequest = {
      completedAt: new Date().toISOString(),
      rating: data?.rating ?? null,
      notes: data?.notes ?? null,
      caloriesBurned: data?.caloriesBurned ?? null,
      additionalTags: []
    };

    console.log('Request body:', requestBody);

    try {
      const response = await apiPut<WorkoutSession>(
        `/api/v1/workouts/${workoutId}/complete`,
        requestBody
      );

      console.log('Complete workout response:', response);

      if (response.success) {
        console.log('✓ Workout completed successfully');
      } else {
        console.error('✗ Workout completion failed:', response.message);
      }

      return response;

    } catch (error: any) {
      console.error('✗ Complete workout error:', error);
      throw error;
    }
  }

  /**
   * Cancel the workout session
   */
  static async cancelWorkout(workoutId: string): Promise<ApiResponse<WorkoutSession>> {
    console.log('Cancelling workout:', workoutId);

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
    console.log(`Deleting set: workout=${workoutId}, exercise=${exerciseIndex}, set=${setIndex}`);

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
    console.log(`Deleting exercise: workout=${workoutId}, exercise=${exerciseIndex}`);

    const response = await apiDelete<WorkoutSession>(
      `/api/v1/workouts/${workoutId}/exercises/${exerciseIndex}`
    );
    return response;
  }


  /**
   * Add exercise to active workout (alternative signature)
   */
  static async addExerciseToWorkout(
    workoutId: string,
    exerciseData: {
      exerciseId: string;
      exerciseName: string;
      notes?: string;
    }
  ): Promise<ApiResponse<WorkoutSession>> {
    console.log('Adding exercise to workout (full response):', workoutId, exerciseData);

    const response = await apiPost<WorkoutSession>(
      `/api/v1/workouts/${workoutId}/exercises`,
      exerciseData
    );
    return response;
  }

  /**
   * Log a new set for an exercise
   */
  static async logSet(
    workoutId: string,
    exerciseIndex: number,
    setData: UpdateSetRequest
  ): Promise<ApiResponse<WorkoutSession>> {
    console.log(`Logging set: workout=${workoutId}, exercise=${exerciseIndex}`, setData);

    const response = await apiPost<WorkoutSession>(
      `/api/v1/workouts/${workoutId}/exercises/${exerciseIndex}/sets`,
      setData
    );
    return response;
  }

  /**
   * Get user's workout history
   */
  static async getUserWorkouts(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<WorkoutSession[]>> {
    console.log('Fetching user workouts:', { startDate, endDate });

    let url = '/api/v1/workouts';
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await apiGet<WorkoutSession[]>(url);
    return response;
  }
}
