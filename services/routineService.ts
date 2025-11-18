import { apiGet, apiPost } from './api';
import { ApiResponse, RoutineFolder, WorkoutPlan, SaveRoutineResponse } from '@/types/api';

/**
 * Routine Service
 * Handles all routine-related API calls
 */
export class RoutineService {
  /**
   * Fetch all public routine folders
   * @returns Promise with array of public routine folders
   */
  static async getPublicRoutineFolders(): Promise<ApiResponse<RoutineFolder[]>> {
    return apiGet<RoutineFolder[]>('/api/v1/routine-folders/public');
  }

  /**
   * Fetch a specific routine folder by ID
   * @param id - The routine folder ID
   * @returns Promise with routine folder details
   */
  static async getRoutineFolderById(id: string): Promise<ApiResponse<RoutineFolder>> {
    return apiGet<RoutineFolder>(`/api/v1/routine-folders/${id}`);
  }

  /**
   * Fetch all workout plans for a specific routine folder
   * @param routineFolderId - The routine folder ID
   * @returns Promise with array of workout plans
   */
  static async getWorkoutPlansByRoutineFolderId(routineFolderId: string): Promise<ApiResponse<WorkoutPlan[]>> {
    return apiGet<WorkoutPlan[]>(`/api/v1/workout-plans?routineFolderId=${routineFolderId}`);
  }

  /**
   * Save a public routine folder to user's personal collection
   * @param publicRoutineId - The public routine folder ID to save
   * @returns Promise with saved routine folder and workout plans
   */
  static async savePublicRoutine(publicRoutineId: string): Promise<ApiResponse<SaveRoutineResponse>> {
    return apiPost<SaveRoutineResponse>(`/api/v1/routine-folders/save/${publicRoutineId}`);
  }

  /**
   * Check if a routine is already saved by the user
   * @param publicRoutineId - The public routine folder ID
   * @returns Promise with boolean indicating if routine is saved
   */
  static async isRoutineSaved(publicRoutineId: string): Promise<ApiResponse<{ isSaved: boolean }>> {
    return apiGet<{ isSaved: boolean }>(`/api/v1/routine-folders/is-saved/${publicRoutineId}`);
  }
}

