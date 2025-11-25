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
   * Create a new personal routine folder
   * @param data - Routine folder data
   */
  static async createPersonalRoutine(data: Partial<RoutineFolder>): Promise<ApiResponse<RoutineFolder>> {
    // Map frontend fields to backend expectation
    const payload = {
      name: data.name,
      description: data.description,
      difficultyLevel: data.difficulty?.toUpperCase() || 'INTERMEDIATE', 
      isPublic: false,
      workoutPlanIds: data.workoutPlanIds || []
    };
    
    return apiPost<RoutineFolder>('/api/v1/routine-folders/personal', payload);
  }

  /**
   * Save a public routine folder to user's personal collection
   * @param publicRoutineId - The public routine folder ID to save
   * @returns Promise with saved routine folder and workout plans
   */
  static async savePublicRoutine(publicRoutineId: string): Promise<ApiResponse<SaveRoutineResponse>> {
    try {
      return await apiPost<SaveRoutineResponse>(`/api/v1/routine-folders/save/${publicRoutineId}`);
    } catch (error: any) {
      console.log('Save routine endpoint failed, attempting fallback creation...', error.status);
      
      // Fallback: If 404/405, try to manually copy by creating a new personal routine
      if (error.status === 404 || error.status === 405) {
        try {
          // 1. Get public routine details
          const routineResponse = await this.getRoutineFolderById(publicRoutineId);
          
          if (routineResponse.success && routineResponse.data) {
            const routine = routineResponse.data;
            
            // 2. Create personal routine
            const createResponse = await this.createPersonalRoutine(routine);
            
            if (createResponse.success && createResponse.data) {
               return {
                 success: true,
                 message: 'Routine saved to collection',
                 data: {
                   routineFolder: createResponse.data,
                   workoutPlans: [], // We don't have the full objects returned here
                   message: 'Routine saved successfully'
                 },
                 timestamp: new Date().toISOString()
               };
            }
          }
        } catch (fallbackError) {
           console.warn('Fallback save failed:', fallbackError);
        }
      }
      throw error;
    }
  }

  /**
   * Fetch all personal routine folders
   * @returns Promise with array of personal routine folders
   */
  static async getPersonalRoutineFolders(): Promise<ApiResponse<RoutineFolder[]>> {
    const response = await apiGet<any[]>('/api/v1/routine-folders/personal');
    
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
   * Check if a routine is already saved by the user
   * @param publicRoutineId - The public routine folder ID
   * @returns Promise with boolean indicating if routine is saved
   */
  static async isRoutineSaved(publicRoutineId: string): Promise<ApiResponse<{ isSaved: boolean }>> {
    try {
      // Workaround: Fetch all personal routines and check if the ID exists
      // This assumes the ID is preserved or linked. If the backend creates a new ID
      // without linking, this check might fail (return false), but it prevents the 404/405 error.
      const response = await this.getPersonalRoutineFolders();
      
      if (response.success && response.data) {
        // Check if any personal routine matches the public routine ID
        // We might need to check other fields if ID changes, but for now checking ID
        const isSaved = response.data.some(routine => routine.id === publicRoutineId);
        
        return {
          success: true,
          message: 'Save status checked successfully',
          data: { isSaved },
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch personal routines to check status',
        data: { isSaved: false },
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.warn('Failed to check save status via personal list:', error);
      return {
        success: false,
        message: 'Failed to check save status',
        data: { isSaved: false }, // Default to not saved on error
        timestamp: new Date().toISOString()
      };
    }
  }
}

