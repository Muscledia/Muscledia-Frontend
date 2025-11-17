import { apiGet } from './api';
import { WorkoutPlan, ApiResponse } from '@/types/api';
import { API_CONFIG } from '@/config/api';

/**
 * Service for managing workout plans
 */
export class WorkoutPlanService {
  /**
   * Fetch workout plans by routine folder ID
   * @param routineFolderId - The routine folder ID
   * @returns Promise<ApiResponse<WorkoutPlan[]>>
   */
  static async getWorkoutPlansByRoutineFolder(
    routineFolderId: string
  ): Promise<ApiResponse<WorkoutPlan[]>> {
    return apiGet<WorkoutPlan[]>(
      API_CONFIG.ENDPOINTS.WORKOUT_PLANS.GET_BY_ROUTINE_FOLDER(routineFolderId)
    );
  }

  /**
   * Fetch a specific workout plan by ID
   * @param id - The workout plan ID
   * @returns Promise<ApiResponse<WorkoutPlan>>
   */
  static async getWorkoutPlanById(id: string): Promise<ApiResponse<WorkoutPlan>> {
    return apiGet<WorkoutPlan>(API_CONFIG.ENDPOINTS.WORKOUT_PLANS.GET_BY_ID(id));
  }
}

