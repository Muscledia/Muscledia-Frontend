import { apiGet } from './api';
import { RoutineFolder, ApiResponse } from '@/types/api';
import { API_CONFIG } from '@/config/api';

/**
 * Service for managing routine folders
 */
export class RoutineFolderService {
  /**
   * Fetch all public routine folders
   * @returns Promise<ApiResponse<RoutineFolder[]>>
   */
  static async getPublicRoutineFolders(): Promise<ApiResponse<RoutineFolder[]>> {
    return apiGet<RoutineFolder[]>(API_CONFIG.ENDPOINTS.ROUTINE_FOLDERS.PUBLIC);
  }

  /**
   * Fetch a specific routine folder by ID
   * @param id - The routine folder ID
   * @returns Promise<ApiResponse<RoutineFolder>>
   */
  static async getRoutineFolderById(id: string): Promise<ApiResponse<RoutineFolder>> {
    return apiGet<RoutineFolder>(API_CONFIG.ENDPOINTS.ROUTINE_FOLDERS.GET_BY_ID(id));
  }
}

