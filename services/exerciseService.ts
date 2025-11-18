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
   * Fetch all exercises (for browsing)
   * @returns Promise with array of all exercises
   */
  static async getAllExercises(): Promise<ApiResponse<Exercise[]>> {
    return apiGet<Exercise[]>('/api/v1/exercises');
  }
}

