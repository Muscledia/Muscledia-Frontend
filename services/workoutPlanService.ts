// services/workoutPlanService.ts
// Comprehensive service for all workout plan CRUD operations
// Updated to match API Documentation (Image 4) endpoints

import { apiGet, apiPost, apiPut, apiDelete } from './api';
import {
  ApiResponse,
  WorkoutPlan,
  PlannedExercise,
  PlannedSet,
  CreateWorkoutPlanRequest,
  UpdateWorkoutPlanRequest,
  AddExerciseToWorkoutPlanRequest,
  Exercise,
} from '@/types/api';

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
   * Create a new personal workout plan
   * Endpoint: POST /api/v1/workout-plans/personal
   */
  static async createWorkoutPlan(
    data: CreateWorkoutPlanRequest
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const payload = {
        title: data.title,
        description: data.description || '',
        estimatedDurationMinutes: data.estimatedDurationMinutes || 0,
        isPublic: data.isPublic ?? false,
        exercises: data.exercises || [],
      };

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
    data: Partial<WorkoutPlan> // Accepts any subset of the plan
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
   * Base Path Updated: /api/v1/workout-plans/...
   */
  static async addExerciseToWorkoutPlan(
    planId: string,
    exercise: AddExerciseToWorkoutPlanRequest
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const payload = {
        exerciseTemplateId: exercise.exerciseTemplateId,
        title: exercise.title,
        notes: exercise.notes || '',
        sets: exercise.sets || [],
        restSeconds: exercise.restSeconds || 120,
      };

      const response = await apiPost<WorkoutPlan>(
        `/api/v1/workout-plans/${planId}/exercises`,
        payload
      );
      return response;
    } catch (error) {
      console.error('Failed to add exercise to workout plan:', error);
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
   * Endpoint: GET /api/v1/exercises/search (Standard convention)
   */
  static async browseExercises(
    search?: string,
    category?: string,
    muscle?: string
  ): Promise<ApiResponse<Exercise[]>> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search); // Changed 'search' to 'q' (common standard)
      if (category) params.append('category', category);
      if (muscle) params.append('muscle', muscle);

      const queryString = params.toString();
      // Assuming a generic exercise endpoint exists as verified in previous steps
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
   * Logic: Fetches original -> Cleanse ID -> Create new via POST /personal
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

      // Create new plan using the source data
      // Note: We deliberately strip the ID and created dates
      const createResponse = await this.createWorkoutPlan({
        title: newTitle,
        description: sourcePlan.description,
        exercises: sourcePlan.exercises,
        estimatedDurationMinutes: sourcePlan.estimatedDurationMinutes,
        isPublic: false, // Duplicates should default to private/personal
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
        sets: exerciseToDuplicate.sets.map(s => ({...s, setNumber: undefined})), // Ensure new sets get new IDs/Numbers if backend handles it
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
