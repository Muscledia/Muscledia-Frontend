// services/RoutineService.ts - COMPLETE with all CRUD operations

import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { ApiResponse, RoutineFolder, WorkoutPlan, SaveRoutineResponse, PlannedExercise } from '@/types';

/**
 * Routine Service
 * Handles all routine-related API calls with proper endpoint routing
 *
 * ARCHITECTURE:
 * - Public routines: Read-only access, browsing, saving to collection
 * - Personal routines: Full CRUD access for owner
 * - Separation of concerns: Business logic in service, HTTP in API layer
 */
export class RoutineService {

  private static normalizeRoutineFolder(data: any): RoutineFolder {
    return {
      id: data.id,
      hevyId: data.hevyId,
      title: data.title || data.name || 'Untitled Routine',
      name: data.title || data.name || 'Untitled Routine',
      description: data.description || 'No description available',
      difficultyLevel: data.difficultyLevel,
      difficulty: data.difficultyLevel?.toLowerCase() || 'intermediate',
      equipmentType: data.equipmentType,
      workoutSplit: data.workoutSplit,
      duration: data.duration || `${data.workoutPlanCount || 0} workouts`,
      imageUrl: data.imageUrl,
      isPublic: data.isPublic ?? true,
      createdBy: data.createdBy?.toString() || 'Unknown',
      usageCount: data.usageCount || 0,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      folderIndex: data.folderIndex,
      workoutPlanIds: data.workoutPlanIds || [],
      workoutPlans: data.workoutPlans
        ? data.workoutPlans.map((plan: any) => RoutineService.normalizeWorkoutPlan(plan))
        : [],
      workoutPlanCount: data.workoutPlanCount || data.workoutPlans?.length || 0,
      personal: data.personal ?? !data.isPublic,
    };
  }

  private static normalizeWorkoutPlan(data: any): WorkoutPlan {
    return {
      id: data.id,
      title: data.title || data.name || 'Untitled Workout',
      name: data.title || data.name || 'Untitled Workout',
      folderId: data.folderId,
      description: data.description || '',
      exercises: data.exercises
        ? data.exercises.map((ex: any) => RoutineService.normalizePlannedExercise(ex))
        : [],
      estimatedDurationMinutes: data.estimatedDurationMinutes,
      estimatedDuration: data.estimatedDurationMinutes || 0,
      isPublic: data.isPublic ?? true,
      createdBy: data.createdBy || 0,
      usageCount: data.usageCount || 0,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      exerciseCount: data.exercises?.length || 0,
      difficulty: data.difficulty,
      targetMuscleGroups: data.targetMuscleGroups || [],
    };
  }

  private static normalizePlannedExercise(data: any): PlannedExercise {
    return {
      index: data.index ?? 0,
      title: data.title || 'Exercise',
      name: data.title || 'Exercise',
      notes: data.notes,
      exerciseTemplateId: data.exerciseTemplateId,
      supersetId: data.supersetId,
      restSeconds: data.restSeconds ?? 60,
      sets: data.sets || [],
    };
  }

  // ===============================
  // PUBLIC ROUTINE OPERATIONS (Read-Only)
  // ===============================

  /**
   * Fetch all public routine folders (WITHOUT workout plans)
   * Use case: Routine exploration, browsing
   */
  static async getPublicRoutineFolders(): Promise<ApiResponse<RoutineFolder[]>> {
    console.log('Fetching public routine folders...');

    const response = await apiGet<any[]>('/api/v1/routine-folders/public');

    if (response.success && response.data) {
      response.data = response.data.map((item: any) =>
        RoutineService.normalizeRoutineFolder(item)
      );
    }

    return response as ApiResponse<RoutineFolder[]>;
  }

  /**
   * Fetch a specific public routine folder by ID (WITH workout plans and exercises)
   * Use case: Viewing public routine details before saving
   */
  static async getPublicRoutineFolderById(id: string): Promise<ApiResponse<RoutineFolder>> {
    console.log('Fetching public routine folder:', id);

    const response = await apiGet<any>(`/api/v1/routine-folders/public/${id}`);

    if (response.success && response.data) {
      response.data = RoutineService.normalizeRoutineFolder(response.data);
    }

    return response as ApiResponse<RoutineFolder>;
  }

  // ===============================
  // PERSONAL ROUTINE OPERATIONS (Full CRUD)
  // ===============================

  /**
   * Fetch all personal routine folders (WITH workout plans and exercises)
   * Use case: My routines list
   */
  static async getPersonalRoutineFolders(): Promise<ApiResponse<RoutineFolder[]>> {
    console.log('Fetching personal routine folders...');

    const response = await apiGet<any[]>('/api/v1/routine-folders/personal');

    if (response.success && response.data) {
      response.data = response.data.map((item: any) =>
        RoutineService.normalizeRoutineFolder(item)
      );
    }

    return response as ApiResponse<RoutineFolder[]>;
  }

  /**
   * Get a specific personal routine folder by ID
   * Use case: Viewing/editing personal routine
   */
  static async getPersonalRoutineFolderById(id: string): Promise<ApiResponse<RoutineFolder>> {
    console.log('Fetching personal routine folder:', id);

    const response = await apiGet<any>(`/api/v1/routine-folders/personal`);

    if (response.success && response.data) {
      const folders = response.data.map((item: any) =>
        RoutineService.normalizeRoutineFolder(item)
      );
      const folder = folders.find((f: RoutineFolder) => f.id === id);

      if (folder) {
        return {
          success: true,
          data: folder,
          timestamp: new Date().toISOString()
        };
      }
    }

    return {
      success: false,
      message: 'Personal routine folder not found',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a new personal routine folder
   * Use case: Creating custom routine from scratch
   */
  static async createPersonalRoutine(
    data: Partial<RoutineFolder>
  ): Promise<ApiResponse<RoutineFolder>> {
    console.log('Creating personal routine:', data.title);

    const payload = {
      title: data.title || data.name,
      description: data.description,
      difficultyLevel: data.difficultyLevel || data.difficulty?.toUpperCase() || 'INTERMEDIATE',
      equipmentType: data.equipmentType,
      workoutSplit: data.workoutSplit,
      isPublic: false,
      workoutPlanIds: data.workoutPlanIds || []
    };

    const response = await apiPost<any>('/api/v1/routine-folders/personal', payload);

    if (response.success && response.data) {
      response.data = RoutineService.normalizeRoutineFolder(response.data);
    }

    return response as ApiResponse<RoutineFolder>;
  }

  /**
   * Update personal routine folder
   * Use case: Renaming routine, changing description, metadata
   * Business logic: Only owner can update
   */
  static async updatePersonalRoutine(
    id: string,
    updates: {
      title?: string;
      description?: string;
      difficultyLevel?: string;
      equipmentType?: string;
      workoutSplit?: string;
    }
  ): Promise<ApiResponse<RoutineFolder>> {
    console.log('Updating personal routine:', id, updates);

    const response = await apiPut<any>(
      `/api/v1/routine-folders/personal/${id}`,
      updates
    );

    if (response.success && response.data) {
      response.data = RoutineService.normalizeRoutineFolder(response.data);
    }

    return response as ApiResponse<RoutineFolder>;
  }

  /**
   * Delete personal routine folder
   * Use case: Removing routine from collection
   * Business logic: Deletes folder and all personal workout plans
   */
  static async deletePersonalRoutine(id: string): Promise<ApiResponse<void>> {
    console.log('=== DELETING PERSONAL ROUTINE ===');
    console.log('Routine ID:', id);

    try {
      const response = await apiDelete<void>(`/api/v1/routine-folders/personal/${id}`);

      if (response.success) {
        console.log('✓ Routine deleted successfully');
      } else {
        console.error('✗ Routine deletion failed:', response.message);
      }

      return response;

    } catch (error: any) {
      console.error('✗ Delete routine error:', error);

      // Provide user-friendly error messages
      if (error.status === 403) {
        throw new Error('You can only delete your own routines');
      } else if (error.status === 404) {
        throw new Error('Routine not found');
      } else if (error.status === 400) {
        throw new Error('Cannot delete public routines');
      } else {
        throw new Error(error.message || 'Failed to delete routine');
      }
    }
  }

  /**
   * Add workout plan to personal routine folder
   * Use case: Adding existing workout plan to routine
   * Business logic: Only owner can add plans
   */
  static async addWorkoutPlanToRoutine(
    folderId: string,
    planId: string
  ): Promise<ApiResponse<RoutineFolder>> {
    console.log('Adding workout plan to routine:', { folderId, planId });

    const response = await apiPost<any>(
      `/api/v1/routine-folders/personal/${folderId}/workout-plans/${planId}`,
      {}
    );

    if (response.success && response.data) {
      response.data = RoutineService.normalizeRoutineFolder(response.data);
    }

    return response as ApiResponse<RoutineFolder>;
  }

  /**
   * Remove workout plan from personal routine folder
   * Use case: Removing workout plan from routine
   * Business logic: Only owner can remove plans
   */
  static async removeWorkoutPlanFromRoutine(
    folderId: string,
    planId: string
  ): Promise<ApiResponse<RoutineFolder>> {
    console.log('Removing workout plan from routine:', { folderId, planId });

    const response = await apiDelete<any>(
      `/api/v1/routine-folders/personal/${folderId}/workout-plans/${planId}`
    );

    if (response.success && response.data) {
      response.data = RoutineService.normalizeRoutineFolder(response.data);
    }

    return response as ApiResponse<RoutineFolder>;
  }

  // ===============================
  // SAVE TO COLLECTION OPERATION
  // ===============================

  /**
   * Save a public routine folder to user's personal collection
   * Use case: Saving public routine for personal use
   * Business logic: Creates personal copy with all workout plans
   */
  static async savePublicRoutine(
    publicRoutineId: string
  ): Promise<ApiResponse<SaveRoutineResponse>> {
    console.log('Saving public routine to personal collection:', publicRoutineId);

    try {
      const response = await apiPost<any>(
        `/api/v1/routine-folders/save/${publicRoutineId}`,
        {}
      );

      if (response.success && response.data) {
        const isWrappedFormat = response.data.routineFolder !== undefined;

        if (isWrappedFormat) {
          const normalized = {
            routineFolder: RoutineService.normalizeRoutineFolder(response.data.routineFolder),
            workoutPlans: response.data.workoutPlans
              ? response.data.workoutPlans.map((plan: any) =>
                RoutineService.normalizeWorkoutPlan(plan)
              )
              : [],
            message: response.data.message || 'Routine saved successfully'
          };

          return {
            ...response,
            data: normalized
          } as ApiResponse<SaveRoutineResponse>;
        } else {
          const normalizedFolder = RoutineService.normalizeRoutineFolder(response.data);

          return {
            ...response,
            data: {
              routineFolder: normalizedFolder,
              workoutPlans: normalizedFolder.workoutPlans || [],
              message: 'Routine saved successfully'
            }
          } as ApiResponse<SaveRoutineResponse>;
        }
      }

      return response as ApiResponse<SaveRoutineResponse>;

    } catch (error: any) {
      console.log('Save routine endpoint failed, attempting fallback...', error.status);

      // Fallback for missing endpoint
      if (error.status === 404 || error.status === 405) {
        try {
          const routineResponse = await RoutineService.getPublicRoutineFolderById(
            publicRoutineId
          );

          if (routineResponse.success && routineResponse.data) {
            const routine = routineResponse.data;
            const createResponse = await RoutineService.createPersonalRoutine(routine);

            if (createResponse.success && createResponse.data) {
              return {
                success: true,
                message: 'Routine saved to collection',
                data: {
                  routineFolder: createResponse.data,
                  workoutPlans: routine.workoutPlans || [],
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
   * Check if a routine is already saved by the user
   * Use case: Showing saved state in UI
   */
  static async isRoutineSaved(
    publicRoutineId: string
  ): Promise<ApiResponse<{ isSaved: boolean }>> {
    try {
      const response = await RoutineService.getPersonalRoutineFolders();

      if (response.success && response.data) {
        const isSaved = response.data.some(
          routine => routine.id === publicRoutineId
        );

        return {
          success: true,
          message: 'Save status checked successfully',
          data: { isSaved },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: false,
        message: 'Failed to fetch personal routines',
        data: { isSaved: false },
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.warn('Failed to check save status:', error);
      return {
        success: false,
        message: 'Failed to check save status',
        data: { isSaved: false },
        timestamp: new Date().toISOString()
      };
    }
  }
}
