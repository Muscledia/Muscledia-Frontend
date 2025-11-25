import { apiGet } from './api';
import { ApiResponse, WorkoutPlan, WorkoutPlanDetail } from '@/types/api';

/**
 * Workout Plan Service
 * Handles all workout plan-related API calls
 */
export class WorkoutPlanService {
  /**
   * Fetch all workout plans for a specific routine folder
   * @param routineFolderId - The routine folder ID
   * @returns Promise with array of workout plans
   */
  static async getWorkoutPlansByRoutineFolderId(routineFolderId: string): Promise<ApiResponse<WorkoutPlan[]>> {
    try {
      // Try the nested endpoint first
      return await apiGet<WorkoutPlan[]>(`/api/v1/routine-folders/${routineFolderId}/workout-plans`);
    } catch (error: any) {
      // If 404/405, try alternative endpoint
      if (error.status === 404 || error.status === 405) {
        console.log('Nested endpoint not found, trying alternative...');
        try {
          return await apiGet<WorkoutPlan[]>(`/api/v1/workout-plans?routineFolderId=${routineFolderId}`);
        } catch (altError: any) {
          // If both fail, return empty array with message
          console.warn('Both workout plan endpoints failed, returning empty array');
          return {
            success: true,
            message: 'No workout plans available',
            data: [],
            timestamp: new Date().toISOString(),
          } as ApiResponse<WorkoutPlan[]>;
        }
      }
      throw error;
    }
  }

  /**
   * Fetch a specific workout plan by ID (basic info)
   * @param id - The workout plan ID
   * @returns Promise with workout plan details
   */
  static async getWorkoutPlanById(id: string): Promise<ApiResponse<WorkoutPlan>> {
    return apiGet<WorkoutPlan>(`/api/v1/workout-plans/${id}`);
  }

  /**
   * Fetch a specific workout plan with full details including exercises
   * @param id - The workout plan ID
   * @returns Promise with workout plan detail including exercises
   */
  static async getWorkoutPlanDetailById(id: string): Promise<ApiResponse<WorkoutPlanDetail>> {
    return apiGet<WorkoutPlanDetail>(`/api/v1/workout-plans/${id}`);
  }
}

