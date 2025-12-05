// services/ExerciseService.ts

import { apiGet, apiPost, apiDelete } from './api';
import { ApiResponse, Exercise } from '@/types/api';

export interface ExerciseFilters {
  difficulty?: string[];
  equipment?: string[];
  targetMuscle?: string[];
  bodyPart?: string[];
  searchQuery?: string;
}

/**
 * Exercise Service
 * Handles all exercise-related API calls
 */
export class ExerciseService {

  /**
   * Fetch all exercises
   * @returns Promise with array of all exercises
   */
  static async getAllExercises(): Promise<ApiResponse<Exercise[]>> {
    return apiGet<Exercise[]>('/api/v1/exercises');
  }

  /**
   * Fetch a specific exercise by ID
   * @param id - The exercise ID
   * @returns Promise with exercise details
   */
  static async getExerciseById(id: string): Promise<ApiResponse<Exercise>> {
    return apiGet<Exercise>(`/api/v1/exercises/${id}`);
  }

  /**
   * Fetch exercise by external API ID
   * @param externalId - The external API ID
   * @returns Promise with exercise details
   */
  static async getExerciseByExternalId(externalId: string): Promise<ApiResponse<Exercise>> {
    return apiGet<Exercise>(`/api/v1/exercises/external/${externalId}`);
  }

  /**
   * Search exercises by name
   * @param name - Search query
   * @param difficulty - Optional difficulty filter
   * @returns Promise with array of matching exercises
   */
  static async searchExercises(name: string, difficulty?: string): Promise<ApiResponse<Exercise[]>> {
    const params = new URLSearchParams({ name });
    if (difficulty) {
      params.append('difficulty', difficulty);
    }
    return apiGet<Exercise[]>(`/api/v1/exercises/search?${params.toString()}`);
  }

  /**
   * Fetch exercises by difficulty level
   * @param difficulty - Difficulty level (BEGINNER, INTERMEDIATE, ADVANCED)
   * @param page - Optional page number
   * @param size - Optional page size
   * @returns Promise with array of exercises
   */
  static async getExercisesByDifficulty(
    difficulty: string,
    page?: number,
    size?: number
  ): Promise<ApiResponse<Exercise[]>> {
    let url = `/api/v1/exercises/difficulty/${difficulty}`;
    if (page !== undefined && size !== undefined) {
      url += `?page=${page}&size=${size}`;
    }
    return apiGet<Exercise[]>(url);
  }

  /**
   * Fetch exercises by equipment type
   * @param equipment - Equipment type
   * @returns Promise with array of exercises
   */
  static async getExercisesByEquipment(equipment: string): Promise<ApiResponse<Exercise[]>> {
    return apiGet<Exercise[]>(`/api/v1/exercises/equipment/${encodeURIComponent(equipment)}`);
  }

  /**
   * Fetch exercises by multiple equipment types
   * @param types - Array of equipment types
   * @returns Promise with array of exercises
   */
  static async getExercisesByEquipmentTypes(types: string[]): Promise<ApiResponse<Exercise[]>> {
    const params = new URLSearchParams();
    types.forEach(type => params.append('types', type));
    return apiGet<Exercise[]>(`/api/v1/exercises/equipment/types?${params.toString()}`);
  }

  /**
   * Fetch exercises by target muscle
   * @param muscle - Target muscle name
   * @returns Promise with array of exercises
   */
  static async getExercisesByTargetMuscle(muscle: string): Promise<ApiResponse<Exercise[]>> {
    return apiGet<Exercise[]>(`/api/v1/exercises/target-muscle/${encodeURIComponent(muscle)}`);
  }

  /**
   * Fetch exercises by multiple target muscles
   * @param muscles - Array of target muscle names
   * @returns Promise with array of exercises
   */
  static async getExercisesByTargetMuscles(muscles: string[]): Promise<ApiResponse<Exercise[]>> {
    const params = new URLSearchParams();
    muscles.forEach(muscle => params.append('muscles', muscle));
    return apiGet<Exercise[]>(`/api/v1/exercises/target-muscles?${params.toString()}`);
  }

  /**
   * Fetch exercises by primary muscle group
   * @param muscleName - Muscle group name
   * @returns Promise with array of exercises
   */
  static async getExercisesByPrimaryMuscleGroup(muscleName: string): Promise<ApiResponse<Exercise[]>> {
    return apiGet<Exercise[]>(`/api/v1/exercises/muscle-group/${encodeURIComponent(muscleName)}`);
  }

  /**
   * Fetch bodyweight exercises only
   * @returns Promise with array of bodyweight exercises
   */
  static async getBodyweightExercises(): Promise<ApiResponse<Exercise[]>> {
    return apiGet<Exercise[]>('/api/v1/exercises/bodyweight');
  }

  /**
   * Fetch exercises by difficulty and target muscle
   * @param difficulty - Difficulty level
   * @param muscle - Target muscle name
   * @returns Promise with array of exercises
   */
  static async getExercisesByDifficultyAndMuscle(
    difficulty: string,
    muscle: string
  ): Promise<ApiResponse<Exercise[]>> {
    return apiGet<Exercise[]>(
      `/api/v1/exercises/difficulty/${difficulty}/muscle/${encodeURIComponent(muscle)}`
    );
  }

  /**
   * Count exercises by difficulty
   * @param difficulty - Difficulty level
   * @returns Promise with count
   */
  static async countExercisesByDifficulty(difficulty: string): Promise<ApiResponse<number>> {
    return apiGet<number>(`/api/v1/exercises/difficulty/${difficulty}/count`);
  }

  /**
   * Apply multiple filters to exercises (client-side filtering)
   * This method fetches all exercises and filters them locally for better performance
   * @param filters - Filter criteria
   * @returns Promise with array of filtered exercises
   */
  static async getExercisesWithFilters(filters: ExerciseFilters): Promise<ApiResponse<Exercise[]>> {
    try {
      const allExercisesResponse = await this.getAllExercises();

      if (!allExercisesResponse.success || !allExercisesResponse.data) {
        return allExercisesResponse;
      }

      let filteredExercises = allExercisesResponse.data;

      // Apply search query filter
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        filteredExercises = filteredExercises.filter(exercise =>
          exercise.name.toLowerCase().includes(query) ||
          exercise.targetMuscle?.toLowerCase().includes(query) ||
          exercise.equipment?.toLowerCase().includes(query) ||
          exercise.bodyPart?.toLowerCase().includes(query)
        );
      }

      // Apply difficulty filter
      if (filters.difficulty && filters.difficulty.length > 0) {
        filteredExercises = filteredExercises.filter(exercise =>
          filters.difficulty!.includes(exercise.difficulty || '')
        );
      }

      // Apply equipment filter
      if (filters.equipment && filters.equipment.length > 0) {
        filteredExercises = filteredExercises.filter(exercise =>
          filters.equipment!.includes(exercise.equipment || '')
        );
      }

      // Apply target muscle filter
      if (filters.targetMuscle && filters.targetMuscle.length > 0) {
        filteredExercises = filteredExercises.filter(exercise =>
          filters.targetMuscle!.includes(exercise.targetMuscle || '')
        );
      }

      // Apply body part filter
      if (filters.bodyPart && filters.bodyPart.length > 0) {
        filteredExercises = filteredExercises.filter(exercise =>
          filters.bodyPart!.includes(exercise.bodyPart || '')
        );
      }

      return {
        success: true,
        data: filteredExercises,
        message: `Found ${filteredExercises.length} exercises`,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to filter exercises',
      };
    }
  }

  /**
   * Create a new exercise (Admin only)
   * @param exercise - Exercise data
   * @returns Promise with created exercise
   */
  static async createExercise(exercise: Partial<Exercise>): Promise<ApiResponse<Exercise>> {
    return apiPost<Exercise>('/api/v1/exercises', exercise);
  }

  /**
   * Delete an exercise (Admin only)
   * @param id - Exercise ID
   * @returns Promise with success status
   */
  static async deleteExercise(id: string): Promise<ApiResponse<void>> {
    return apiDelete<void>(`/api/v1/exercises/${id}`);
  }

  /**
   * Legacy method - Fetch exercises with basic filters
   * @deprecated Use getExercisesWithFilters instead for better filtering
   */
  static async getExercises(filters?: {
    muscleGroup?: string;
    equipment?: string;
    difficulty?: string;
    search?: string;
  }): Promise<ApiResponse<Exercise[]>> {
    const exerciseFilters: ExerciseFilters = {
      targetMuscle: filters?.muscleGroup ? [filters.muscleGroup] : undefined,
      equipment: filters?.equipment ? [filters.equipment] : undefined,
      difficulty: filters?.difficulty ? [filters.difficulty] : undefined,
      searchQuery: filters?.search,
    };

    return this.getExercisesWithFilters(exerciseFilters);
  }

  /**
   * Legacy method - Fetch exercises by workout plan ID
   * @deprecated This endpoint may not exist in the current backend
   */
  static async getExercisesByWorkoutPlanId(workoutPlanId: string): Promise<ApiResponse<Exercise[]>> {
    return apiGet<Exercise[]>(`/api/v1/exercises?workoutPlanId=${workoutPlanId}`);
  }
}
