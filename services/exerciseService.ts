import { apiGet } from './api';
import { ApiResponse, Exercise } from '@/types/api';

/**
 * Exercise Service
 * Handles all exercise-related API calls
 */
export class ExerciseService {
  /**
   * Fetch all exercises for a specific workout plan
   * @param workoutPlanId - The workout plan ID
   * @returns Promise with array of exercises
   */
  static async getExercisesByWorkoutPlanId(workoutPlanId: string): Promise<ApiResponse<Exercise[]>> {
    return apiGet<Exercise[]>(`/api/v1/exercises?workoutPlanId=${workoutPlanId}`);
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
   * Fetch all exercises with optional filters
   * @param filters - Optional filters for exercises
   * @returns Promise with array of exercises
   */
  static async getExercises(filters?: {
    muscleGroup?: string;
    equipment?: string;
    difficulty?: string;
    search?: string;
  }): Promise<ApiResponse<Exercise[]>> {
    const params = new URLSearchParams();
    if (filters?.muscleGroup) params.append('muscleGroup', filters.muscleGroup);
    if (filters?.equipment) params.append('equipment', filters.equipment);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = `/api/v1/exercises${queryString ? `?${queryString}` : ''}`;
    
    return apiGet<Exercise[]>(url);
  }

  /**
   * Fetch all exercises (for browsing) - Deprecated, use getExercises instead
   * @returns Promise with array of all exercises
   */
  static async getAllExercises(): Promise<ApiResponse<Exercise[]>> {
    return this.getExercises();
  }
}

