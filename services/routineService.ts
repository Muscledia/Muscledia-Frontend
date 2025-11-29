// services/RoutineService.ts

import { apiGet, apiPost } from './api';
import { ApiResponse, RoutineFolder, WorkoutPlan, SaveRoutineResponse, PlannedExercise } from '@/types/api';

/**
 * Routine Service
 * Handles all routine-related API calls with proper endpoint routing
 */
export class RoutineService {
  /**
   * Normalize backend response to frontend format
   */
  private static normalizeRoutineFolder(data: any): RoutineFolder {
    return {
      // Core fields
      id: data.id,
      hevyId: data.hevyId,
      title: data.title || data.name || 'Untitled Routine',
      name: data.title || data.name || 'Untitled Routine',
      description: data.description || 'No description available',

      // Difficulty & Equipment
      difficultyLevel: data.difficultyLevel,
      difficulty: data.difficultyLevel?.toLowerCase() || 'intermediate',
      equipmentType: data.equipmentType,
      workoutSplit: data.workoutSplit,

      // Duration
      duration: data.duration || `${data.workoutPlanCount || 0} workouts`,

      // Metadata
      imageUrl: data.imageUrl,
      isPublic: data.isPublic ?? true,
      createdBy: data.createdBy?.toString() || 'Unknown',
      usageCount: data.usageCount || 0,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      folderIndex: data.folderIndex,

      // Workout Plans
      workoutPlanIds: data.workoutPlanIds || [],
      workoutPlans: data.workoutPlans
        ? data.workoutPlans.map((plan: any) => RoutineService.normalizeWorkoutPlan(plan))
        : [],
      workoutPlanCount: data.workoutPlanCount || data.workoutPlans?.length || 0,
      personal: data.personal ?? !data.isPublic,
    };
  }

  /**
   * Normalize workout plan response
   */
  private static normalizeWorkoutPlan(data: any): WorkoutPlan {
    return {
      id: data.id,
      title: data.title || data.name || 'Untitled Workout',
      name: data.title || data.name || 'Untitled Workout',
      folderId: data.folderId,
      description: data.description || '',

      // Exercises
      exercises: data.exercises
        ? data.exercises.map((ex: any) => RoutineService.normalizePlannedExercise(ex))
        : [],

      // Duration
      estimatedDurationMinutes: data.estimatedDurationMinutes,
      estimatedDuration: data.estimatedDurationMinutes || 0,

      // Metadata
      isPublic: data.isPublic ?? true,
      createdBy: data.createdBy || 0,
      usageCount: data.usageCount || 0,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),

      // Computed fields
      exerciseCount: data.exercises?.length || 0,
      difficulty: data.difficulty,
      targetMuscleGroups: data.targetMuscleGroups || [],
    };
  }

  /**
   * Normalize planned exercise
   */
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

  /**
   * Fetch all public routine folders (WITHOUT workout plans)
   */
  static async getPublicRoutineFolders(): Promise<ApiResponse<RoutineFolder[]>> {
    const response = await apiGet<any[]>('/api/v1/routine-folders/public');

    if (response.success && response.data) {
      response.data = response.data.map((item: any) => RoutineService.normalizeRoutineFolder(item));
    }

    return response as ApiResponse<RoutineFolder[]>;
  }

  /**
   * Fetch a specific public routine folder by ID (WITH workout plans and exercises)
   */
  static async getPublicRoutineFolderById(id: string): Promise<ApiResponse<RoutineFolder>> {
    const response = await apiGet<any>(`/api/v1/routine-folders/public/${id}`);

    if (response.success && response.data) {
      response.data = RoutineService.normalizeRoutineFolder(response.data);
    }

    return response as ApiResponse<RoutineFolder>;
  }

  /**
   * Fetch all personal routine folders (WITH workout plans and exercises)
   */
  static async getPersonalRoutineFolders(): Promise<ApiResponse<RoutineFolder[]>> {
    const response = await apiGet<any[]>('/api/v1/routine-folders/personal');

    if (response.success && response.data) {
      response.data = response.data.map((item: any) => RoutineService.normalizeRoutineFolder(item));
    }

    return response as ApiResponse<RoutineFolder[]>;
  }

  /**
   * Create a new personal routine folder
   */
  static async createPersonalRoutine(data: Partial<RoutineFolder>): Promise<ApiResponse<RoutineFolder>> {
    const payload = {
      name: data.title || data.name,
      description: data.description,
      difficultyLevel: data.difficultyLevel || data.difficulty?.toUpperCase() || 'INTERMEDIATE',
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
   * Save a public routine folder to user's personal collection
   */
  static async savePublicRoutine(publicRoutineId: string): Promise<ApiResponse<SaveRoutineResponse>> {
    try {
      const response = await apiPost<any>(`/api/v1/routine-folders/save/${publicRoutineId}`);

      if (response.success && response.data) {
        // Backend returns the routine folder directly, not wrapped
        // Check if response has routineFolder property (old format) or is the folder itself (new format)
        const isWrappedFormat = response.data.routineFolder !== undefined;

        if (isWrappedFormat) {
          // Old format: { routineFolder: {...}, workoutPlans: [...] }
          const normalized = {
            routineFolder: RoutineService.normalizeRoutineFolder(response.data.routineFolder),
            workoutPlans: response.data.workoutPlans
              ? response.data.workoutPlans.map((plan: any) => RoutineService.normalizeWorkoutPlan(plan))
              : [],
            message: response.data.message || 'Routine saved successfully'
          };

          return {
            ...response,
            data: normalized
          } as ApiResponse<SaveRoutineResponse>;
        } else {
          // New format: Backend returns routine folder directly
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

      if (error.status === 404 || error.status === 405) {
        try {
          const routineResponse = await RoutineService.getPublicRoutineFolderById(publicRoutineId);

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
   */
  static async isRoutineSaved(publicRoutineId: string): Promise<ApiResponse<{ isSaved: boolean }>> {
    try {
      const response = await RoutineService.getPersonalRoutineFolders();

      if (response.success && response.data) {
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
