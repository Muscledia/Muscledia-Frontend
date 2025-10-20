import { apiGet, apiPut } from './api';
import { API_CONFIG, buildURL } from '@/config/api';
import { User, ApiResponse } from '@/types/api';

export class UserService {
  /**
   * Get current user profile
   */
  // static async getCurrentUser(): Promise<User> {
  //   const response = await apiGet<User>(
  //     buildURL(API_CONFIG.ENDPOINTS.USER.PROFILE)
  //   );

  //   if (response.success && response.data) {
  //     return response.data;
  //   }

  //   throw new Error(response.message || 'Failed to get user profile');
  // }

  /**
   * Update current user profile
   */
  static async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await apiPut<User>(
      buildURL(API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE),
      updates
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to update profile');
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: number): Promise<User> {
    const response = await apiGet<User>(
      buildURL(API_CONFIG.ENDPOINTS.USER.GET_USER(userId.toString()))
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get user');
  }
}
