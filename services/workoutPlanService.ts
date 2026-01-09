// services/workoutPlanService.ts
// Comprehensive service for all workout plan CRUD operations
// Updated to match API Documentation (Image 4) endpoints

import { apiGet, apiPost, apiPut, apiDelete } from './api';
import {
  ApiResponse,
  WorkoutPlan,
  PlannedSet,
  CreateWorkoutPlanRequest,
  AddExerciseToWorkoutPlanRequest,
  Exercise,
} from '@/types';

/**
 * WorkoutPlanService - Handles all workout plan CRUD operations
 *
 * Architecture:
 * - Aligned with Backend API Endpoints (api/v1/workout-plans/...)
 * - Handles Public vs Personal plan logic
 * - Abstracted Data Access
 */
export class WorkoutPlanService {
  // ===============================
  // WORKOUT PLAN OPERATIONS
  // ===============================

  static async getWorkoutPlanById(planId: string): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const personalPlans = await this.getPersonalWorkoutPlans();
      if (personalPlans.success && personalPlans.data) {
        const found = personalPlans.data.find((p) => p.id === planId);
        if (found) return { success: true, data: found };
      }
      const response = await apiGet<WorkoutPlan>(`/api/v1/workout-plans/public/${planId}`);
      if (response.success) return response;
      throw new Error('Workout plan not found');
    } catch (error: any) {
      console.warn(`WorkoutPlan fetch failed for ${planId}:`, error.message);
      return { success: false, message: 'Workout plan not found' };
    }
  }

  /**
   * Fetch all user's personal workout plans
   * Endpoint: GET /api/v1/workout-plans/personal
   */
  static async getPersonalWorkoutPlans(): Promise<ApiResponse<WorkoutPlan[]>> {
    try {
      const response = await apiGet<WorkoutPlan[]>('/api/v1/workout-plans/personal');
      return response;
    } catch (error) {
      console.error('Failed to fetch personal workout plans:', error);
      throw error;
    }
  }

  /**
   * Fetch user's personal custom workout plans (not in folders)
   * Endpoint: GET /api/v1/workout-plans/personal/custom
   */
  static async getPersonalCustomWorkoutPlans(): Promise<ApiResponse<WorkoutPlan[]>> {
    try {
      const response = await apiGet<WorkoutPlan[]>('/api/v1/workout-plans/personal/custom');
      return response;
    } catch (error) {
      console.error('Failed to fetch personal custom workout plans:', error);
      throw error;
    }
  }

  /**
   * Create a new personal workout plan
   * Endpoint: POST /api/v1/workout-plans/personal
   */
  static async createWorkoutPlan(
    data: CreateWorkoutPlanRequest
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const payload: any = {
        title: data.title,
        description: data.description || '',
        exercises: data.exercises || [],
      };

      // Add optional fields if provided
      if (data.estimatedDuration !== undefined) {
        payload.estimatedDuration = data.estimatedDuration;
      } else if (data.estimatedDurationMinutes !== undefined) {
        payload.estimatedDuration = data.estimatedDurationMinutes;
      }

      if (data.difficulty) {
        payload.difficulty = data.difficulty;
      }

      if (data.workoutType) {
        payload.workoutType = data.workoutType;
      }

      // Only include isPublic if explicitly set (default to false for personal plans)
      if (data.isPublic !== undefined) {
        payload.isPublic = data.isPublic;
      }

      const response = await apiPost<WorkoutPlan>('/api/v1/workout-plans/personal', payload);
      return response;
    } catch (error) {
      console.error('Failed to create workout plan:', error);
      throw error;
    }
  }

  /**
   * Update an existing workout plan
   * Endpoint: PUT /api/v1/workout-plans/{id}
   * UPDATE: Backend now handles partial updates. We only send what changed.
   */
  static async updateWorkoutPlan(
    planId: string,
    data: Partial<WorkoutPlan>
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      console.log(`Updating plan ${planId} with:`, JSON.stringify(data, null, 2));

      const response = await apiPut<WorkoutPlan>(
        `/api/v1/workout-plans/${planId}`,
        data
      );
      return response;
    } catch (error) {
      console.error(`Failed to update workout plan ${planId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a workout plan
   * Endpoint: DELETE /api/v1/workout-plans/{id}
   */
  static async deleteWorkoutPlan(planId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiDelete<void>(`/api/v1/workout-plans/${planId}`);
      return response;
    } catch (error) {
      console.error(`Failed to delete workout plan ${planId}:`, error);
      throw error;
    }
  }

  // ===============================
  // EXERCISE OPERATIONS
  // ===============================

  /**
   * Add exercise to workout plan
   * UPDATED: Now includes instructions field
   * Endpoint: POST /api/v1/workout-plans/{planId}/exercises
   */
  static async addExerciseToWorkoutPlan(
    planId: string,
    exercise: {
      exerciseTemplateId: string;
      title: string;
      notes?: string;
      instructions?: string | string[];  // Accept both string and array
      description?: string;
      bodyPart?: string;
      equipment?: string;
      targetMuscle?: string;
      secondaryMuscles?: string[];
      difficulty?: string;
      category?: string;
      restSeconds?: number;
      sets?: any[];
    }
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      // ✅ Convert instructions to array if it's a string
      let instructionsArray: string[] = [];
      if (typeof exercise.instructions === 'string' && exercise.instructions) {
        // Split by newline and filter out empty lines
        instructionsArray = exercise.instructions
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      } else if (Array.isArray(exercise.instructions)) {
        instructionsArray = exercise.instructions;
      }

      // ✅ Build complete payload with ALL fields
      const payload = {
        exerciseTemplateId: exercise.exerciseTemplateId,
        title: exercise.title,
        notes: exercise.notes || '',

        // ✅ CRITICAL: Instructions must be an array!
        instructions: instructionsArray,

        description: exercise.description || '',

        // Metadata fields
        bodyPart: exercise.bodyPart,
        equipment: exercise.equipment,
        targetMuscle: exercise.targetMuscle,
        secondaryMuscles: exercise.secondaryMuscles || [],
        difficulty: exercise.difficulty,
        category: exercise.category,

        // Configuration
        restSeconds: exercise.restSeconds || 120,

        // Sets
        sets: exercise.sets || [],
      };

      console.log('Adding exercise to plan:', planId);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await apiPost<WorkoutPlan>(
        `/api/v1/workout-plans/${planId}/exercises`,
        payload
      );

      if (response.success) {
        console.log('Successfully added exercise to workout plan');
      }

      return response;
    } catch (error: any) {
      console.error('Failed to add exercise to workout plan:', error.response?.data || error);
      console.error('Error details:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  /**
   * Update exercise in workout plan
   */
  static async updateExerciseInWorkoutPlan(
    planId: string,
    exerciseIndex: number,
    exercise: Partial<AddExerciseToWorkoutPlanRequest>
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const payload: Record<string, any> = {};
      if (exercise.title !== undefined) payload.title = exercise.title;
      if (exercise.notes !== undefined) payload.notes = exercise.notes;
      if (exercise.instructions !== undefined) payload.instructions = exercise.instructions;
      if (exercise.sets !== undefined) payload.sets = exercise.sets;
      if (exercise.restSeconds !== undefined) payload.restSeconds = exercise.restSeconds;

      const response = await apiPut<WorkoutPlan>(
        `/api/v1/workout-plans/${planId}/exercises/${exerciseIndex}`,
        payload
      );
      return response;
    } catch (error) {
      console.error(
        `Failed to update exercise at index ${exerciseIndex} in plan ${planId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete exercise from workout plan
   */
  static async deleteExerciseFromWorkoutPlan(
    planId: string,
    exerciseIndex: number
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const response = await apiDelete<WorkoutPlan>(
        `/api/v1/workout-plans/${planId}/exercises/${exerciseIndex}`
      );
      return response;
    } catch (error) {
      console.error(
        `Failed to delete exercise at index ${exerciseIndex} from plan ${planId}:`,
        error
      );
      throw error;
    }
  }

  // ===============================
  // SET OPERATIONS
  // ===============================

  /**
   * Add a new set to an exercise
   */
  static async addSetToExercise(
    planId: string,
    exerciseIndex: number,
    set?: Partial<PlannedSet>
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const payload = set || {
        setNumber: 1,
        reps: 10,
        type: 'NORMAL',
      };

      const response = await apiPost<WorkoutPlan>(
        `/api/v1/workout-plans/${planId}/exercises/${exerciseIndex}/sets`,
        payload
      );
      return response;
    } catch (error) {
      console.error(
        `Failed to add set to exercise ${exerciseIndex} in plan ${planId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update a specific set in an exercise
   */
  static async updateSet(
    planId: string,
    exerciseIndex: number,
    setIndex: number,
    setData: Partial<PlannedSet>
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const response = await apiPut<WorkoutPlan>(
        `/api/v1/workout-plans/${planId}/exercises/${exerciseIndex}/sets/${setIndex}`,
        setData
      );
      return response;
    } catch (error) {
      console.error(
        `Failed to update set ${setIndex} of exercise ${exerciseIndex} in plan ${planId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete a set from an exercise
   */
  static async deleteSet(
    planId: string,
    exerciseIndex: number,
    setIndex: number
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const response = await apiDelete<WorkoutPlan>(
        `/api/v1/workout-plans/${planId}/exercises/${exerciseIndex}/sets/${setIndex}`
      );
      return response;
    } catch (error) {
      console.error(
        `Failed to delete set ${setIndex} from exercise ${exerciseIndex} in plan ${planId}:`,
        error
      );
      throw error;
    }
  }

  // ===============================
  // EXERCISE BROWSING
  // ===============================

  /**
   * Browse available exercises for adding to a plan
   * Endpoint: GET /api/v1/exercises/search
   */
  static async browseExercises(
    search?: string,
    category?: string,
    muscle?: string
  ): Promise<ApiResponse<Exercise[]>> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (category) params.append('category', category);
      if (muscle) params.append('muscle', muscle);

      const queryString = params.toString();
      const url = `/api/v1/exercises/search${queryString ? `?${queryString}` : ''}`;

      const response = await apiGet<Exercise[]>(url);
      return response;
    } catch (error) {
      console.error('Failed to browse exercises:', error);
      throw error;
    }
  }

  // ===============================
  // UTILITY OPERATIONS
  // ===============================

  /**
   * Duplicate a workout plan
   */
  static async duplicateWorkoutPlan(
    sourcePlanId: string,
    newTitle: string
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const sourceResponse = await this.getWorkoutPlanById(sourcePlanId);

      if (!sourceResponse.success || !sourceResponse.data) {
        throw new Error('Failed to fetch source workout plan');
      }

      const sourcePlan = sourceResponse.data;

      const createResponse = await this.createWorkoutPlan({
        title: newTitle,
        description: sourcePlan.description,
        exercises: sourcePlan.exercises,
        estimatedDurationMinutes: sourcePlan.estimatedDurationMinutes,
        isPublic: false,
      });

      return createResponse;
    } catch (error) {
      console.error(`Failed to duplicate workout plan ${sourcePlanId}:`, error);
      throw error;
    }
  }

  /**
   * Duplicate an exercise within the same plan
   */
  static async duplicateExercise(
    planId: string,
    exerciseIndex: number
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const planResponse = await this.getWorkoutPlanById(planId);

      if (!planResponse.success || !planResponse.data) {
        throw new Error('Failed to fetch workout plan');
      }

      const plan = planResponse.data;
      const exerciseToDuplicate = plan.exercises[exerciseIndex];

      if (!exerciseToDuplicate) {
        throw new Error('Exercise not found at specified index');
      }

      const duplicatedExercise: AddExerciseToWorkoutPlanRequest = {
        exerciseTemplateId: exerciseToDuplicate.exerciseTemplateId,
        title: `${exerciseToDuplicate.title} (Copy)`,
        notes: exerciseToDuplicate.notes,
        instructions: exerciseToDuplicate.instructions,
        sets: exerciseToDuplicate.sets.map(s => ({ ...s, setNumber: undefined })),
        restSeconds: exerciseToDuplicate.restSeconds,
      };

      return this.addExerciseToWorkoutPlan(planId, duplicatedExercise);
    } catch (error) {
      console.error(
        `Failed to duplicate exercise ${exerciseIndex} in plan ${planId}:`,
        error
      );
      throw error;
    }
  }
}
