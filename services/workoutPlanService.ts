// services/workoutPlanService.ts
// Comprehensive service for all workout plan CRUD operations
// Separates concerns: service layer handles business logic, repositories/API calls are abstracted

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
 * - Thin controller layer calls methods here
 * - This service contains business logic for orchestrating operations
 * - Data access abstracted through API calls
 * - Returns typed responses for type safety
 */
export class WorkoutPlanService {
  // ===============================
  // WORKOUT PLAN OPERATIONS
  // ===============================

  /**
   * Fetch all user's workout plans
   * Business logic: Retrieves all personal plans
   */
  static async getMyWorkoutPlans(): Promise<ApiResponse<WorkoutPlan[]>> {
    try {
      const response = await apiGet<WorkoutPlan[]>('/api/v1/my-workout-plans');
      return response;
    } catch (error) {
      console.error('Failed to fetch workout plans:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific workout plan by ID
   * Business logic: Single plan retrieval with all nested data
   */
  static async getWorkoutPlanById(planId: string): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const response = await apiGet<WorkoutPlan>(`/api/v1/workout-plans/${planId}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch workout plan ${planId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new workout plan
   * Business logic: Validates input, creates plan with exercises
   *
   * Separation of concerns: Controller passes DTO, service processes
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

      const response = await apiPost<WorkoutPlan>('/api/v1/my-workout-plans', payload);
      return response;
    } catch (error) {
      console.error('Failed to create workout plan:', error);
      throw error;
    }
  }

  /**
   * Update an existing workout plan
   * Business logic: Partial updates, preserves existing data
   */
  static async updateWorkoutPlan(
    planId: string,
    data: UpdateWorkoutPlanRequest
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const payload: Record<string, any> = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.description !== undefined) payload.description = data.description;
      if (data.estimatedDurationMinutes !== undefined) {
        payload.estimatedDurationMinutes = data.estimatedDurationMinutes;
      }
      if (data.isPublic !== undefined) payload.isPublic = data.isPublic;

      const response = await apiPut<WorkoutPlan>(
        `/api/v1/my-workout-plans/${planId}`,
        payload
      );
      return response;
    } catch (error) {
      console.error(`Failed to update workout plan ${planId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a workout plan
   * Business logic: Removes plan and all associated data
   */
  static async deleteWorkoutPlan(planId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiDelete<void>(`/api/v1/my-workout-plans/${planId}`);
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
   * Business logic: Validates exercise template exists, creates planned exercise with sets
   * Single responsibility: Exercise addition
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
        `/api/v1/my-workout-plans/${planId}/exercises`,
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
   * Business logic: Modifies specific exercise properties
   * Loose coupling: Only updates provided fields
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
        `/api/v1/my-workout-plans/${planId}/exercises/${exerciseIndex}`,
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
   * Business logic: Removes planned exercise and all associated sets
   */
  static async deleteExerciseFromWorkoutPlan(
    planId: string,
    exerciseIndex: number
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const response = await apiDelete<WorkoutPlan>(
        `/api/v1/my-workout-plans/${planId}/exercises/${exerciseIndex}`
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

  /**
   * Update exercise properties while maintaining sets
   * Business logic: Focused update for specific exercise fields
   */
  static async updateExerciseProperties(
    planId: string,
    exerciseIndex: number,
    properties: {
      title?: string;
      notes?: string;
      restSeconds?: number;
    }
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const response = await apiPut<WorkoutPlan>(
        `/api/v1/my-workout-plans/${planId}/exercises/${exerciseIndex}`,
        properties
      );
      return response;
    } catch (error) {
      console.error('Failed to update exercise properties:', error);
      throw error;
    }
  }

  // ===============================
  // SET OPERATIONS
  // ===============================

  /**
   * Add a new set to an exercise
   * Business logic: Appends new set with proper numbering
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
        `/api/v1/my-workout-plans/${planId}/exercises/${exerciseIndex}/sets`,
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
   * Business logic: Modifies set properties (weight, reps, duration, etc)
   */
  static async updateSet(
    planId: string,
    exerciseIndex: number,
    setIndex: number,
    setData: Partial<PlannedSet>
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const response = await apiPut<WorkoutPlan>(
        `/api/v1/my-workout-plans/${planId}/exercises/${exerciseIndex}/sets/${setIndex}`,
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
   * Business logic: Removes set and renumbers remaining sets
   */
  static async deleteSet(
    planId: string,
    exerciseIndex: number,
    setIndex: number
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const response = await apiDelete<WorkoutPlan>(
        `/api/v1/my-workout-plans/${planId}/exercises/${exerciseIndex}/sets/${setIndex}`
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

  /**
   * Bulk update sets for an exercise
   * Business logic: Replaces all sets at once
   * Useful for: Duplicating set schemes, quick modifications
   */
  static async updateExerciseSets(
    planId: string,
    exerciseIndex: number,
    sets: PlannedSet[]
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      const response = await apiPut<WorkoutPlan>(
        `/api/v1/my-workout-plans/${planId}/exercises/${exerciseIndex}`,
        { sets }
      );
      return response;
    } catch (error) {
      console.error(
        `Failed to update sets for exercise ${exerciseIndex} in plan ${planId}:`,
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
   * Business logic: Filters and searches exercise library
   * Loose coupling: Exercise template service is independent
   */
  static async browseExercises(
    search?: string,
    category?: string,
    muscle?: string
  ): Promise<ApiResponse<Exercise[]>> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (muscle) params.append('muscle', muscle);

      const queryString = params.toString();
      const url = `/api/v1/my-workout-plans/browse-exercises${
        queryString ? `?${queryString}` : ''
      }`;

      const response = await apiGet<Exercise[]>(url);
      return response;
    } catch (error) {
      console.error('Failed to browse exercises:', error);
      throw error;
    }
  }

  /**
   * Get exercises with advanced filtering
   * Business logic: Complex filtering with multiple parameters
   */
  static async getExercisesWithFilters(filters: {
    search?: string;
    category?: string;
    muscleGroup?: string;
    equipment?: string;
    difficulty?: string;
  }): Promise<ApiResponse<Exercise[]>> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const queryString = params.toString();
      const url = `/api/v1/my-workout-plans/browse-exercises${
        queryString ? `?${queryString}` : ''
      }`;

      const response = await apiGet<Exercise[]>(url);
      return response;
    } catch (error) {
      console.error('Failed to fetch exercises with filters:', error);
      throw error;
    }
  }

  // ===============================
  // UTILITY OPERATIONS
  // ===============================

  /**
   * Duplicate a workout plan
   * Business logic: Creates copy with new ID, preserves structure
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
        isPublic: sourcePlan.isPublic,
      });

      return createResponse;
    } catch (error) {
      console.error(`Failed to duplicate workout plan ${sourcePlanId}:`, error);
      throw error;
    }
  }

  /**
   * Duplicate an exercise within the same plan
   * Business logic: Creates copy of exercise with sets
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
        sets: exerciseToDuplicate.sets,
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
