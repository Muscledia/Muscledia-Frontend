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
    const response = await apiGet<any[]>('/api/v1/routine-folders/public');
    
    // Map backend fields to frontend format
    if (response.success && response.data) {
      response.data = response.data.map((item: any) => ({
        id: item.id,
        name: item.title || item.name || 'Untitled Routine',
        description: item.description || 'No description available',
        difficulty: item.difficultyLevel?.toLowerCase() || 'intermediate',
        duration: item.duration || `${item.workoutPlanCount || 0} workouts`,
        imageUrl: item.imageUrl,
        isPublic: item.isPublic,
        createdBy: item.createdBy?.toString() || 'Unknown',
        workoutPlanIds: item.workoutPlanIds || [],
      }));
    }
    
    return response as ApiResponse<RoutineFolder[]>;
  }

  /**
   * Fetch a specific routine folder by ID
   * @param id - The routine folder ID
   * @returns Promise with routine folder details
   */
  static async getRoutineFolderById(id: string): Promise<ApiResponse<RoutineFolder>> {
    const response = await apiGet<any>(`/api/v1/routine-folders/${id}`);
    
    // Map backend fields to frontend format
    if (response.success && response.data) {
      response.data = {
        id: response.data.id,
        name: response.data.title || response.data.name || 'Untitled Routine',
        description: response.data.description || 'No description available',
        difficulty: response.data.difficultyLevel?.toLowerCase() || 'intermediate',
        duration: response.data.duration || `${response.data.workoutPlanCount || 0} workouts`,
        imageUrl: response.data.imageUrl,
        isPublic: response.data.isPublic,
        createdBy: response.data.createdBy?.toString() || 'Unknown',
        workoutPlanIds: response.data.workoutPlanIds || [],
      };
    }
    
    return response as ApiResponse<RoutineFolder>;
  }

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
   * Fetch workout plans by their IDs
   * @param planIds - Array of workout plan IDs
   * @returns Promise with array of workout plans
   */
  static async getWorkoutPlansByIds(planIds: string[]): Promise<ApiResponse<WorkoutPlan[]>> {
    if (!planIds || planIds.length === 0) {
      return {
        success: true,
        message: 'No workout plan IDs provided',
        data: [],
        timestamp: new Date().toISOString(),
      } as ApiResponse<WorkoutPlan[]>;
    }

    try {
      // Fetch all plans in parallel
      const planPromises = planIds.map(id => 
        apiGet<WorkoutPlan>(`/api/v1/workout-plans/${id}`)
      );

      const results = await Promise.allSettled(planPromises);
      
      // Filter successful results
      const successfulPlans = results
        .filter((result): result is PromiseFulfilledResult<ApiResponse<WorkoutPlan>> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value.data);

      return {
        success: true,
        message: `Fetched ${successfulPlans.length} of ${planIds.length} workout plans`,
        data: successfulPlans,
        timestamp: new Date().toISOString(),
      } as ApiResponse<WorkoutPlan[]>;
    } catch (error: any) {
      console.error('Error fetching workout plans by IDs:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch workout plans',
        data: [],
        timestamp: new Date().toISOString(),
      } as ApiResponse<WorkoutPlan[]>;
    }
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

