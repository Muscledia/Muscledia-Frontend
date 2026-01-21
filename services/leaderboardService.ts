import { apiGet } from './api';
import { buildURL } from '@/config/api';
import { LeaderboardResponse, LeaderboardType } from '@/types';

export class LeaderboardService {
  /**
   * Get points leaderboard
   * Caching is now handled by React Query in the useLeaderboard hook
   */
  static async getPointsLeaderboard(): Promise<LeaderboardResponse> {
    const url = buildURL('/api/gamification/leaderboards/points');

    try {
      // The backend returns the full LeaderboardResponse structure
      // apiGet wraps it in ApiResponse, so response.data is the LeaderboardResponse
      const response = await apiGet<LeaderboardResponse['data']>(url);
      
      const leaderboardResponse: LeaderboardResponse = {
        success: response.success ?? true,
        message: response.message || 'Points leaderboard retrieved successfully',
        data: response.data!,
        timestamp: response.timestamp || new Date().toISOString(),
      };

      return leaderboardResponse;
    } catch (error: any) {
      console.error('[LeaderboardService] Error fetching points leaderboard:', error);
      throw new Error(error.message || 'Failed to fetch points leaderboard');
    }
  }

  /**
   * Get levels leaderboard
   * Caching is now handled by React Query in the useLeaderboard hook
   */
  static async getLevelsLeaderboard(): Promise<LeaderboardResponse> {
    const url = buildURL('/api/gamification/leaderboards/levels');

    try {
      // The backend returns the full LeaderboardResponse structure
      // apiGet wraps it in ApiResponse, so response.data is the LeaderboardResponse
      const response = await apiGet<LeaderboardResponse['data']>(url);
      
      const leaderboardResponse: LeaderboardResponse = {
        success: response.success ?? true,
        message: response.message || 'Level leaderboard retrieved successfully',
        data: response.data!,
        timestamp: response.timestamp || new Date().toISOString(),
      };

      return leaderboardResponse;
    } catch (error: any) {
      console.error('[LeaderboardService] Error fetching levels leaderboard:', error);
      throw new Error(error.message || 'Failed to fetch levels leaderboard');
    }
  }

  /**
   * Get weekly streak leaderboard
   * Caching is now handled by React Query in the useLeaderboard hook
   */
  static async getWeeklyStreakLeaderboard(): Promise<LeaderboardResponse> {
    const url = buildURL('/api/gamification/leaderboards/weekly-streak');

    try {
      // The backend returns the full LeaderboardResponse structure
      // apiGet wraps it in ApiResponse, so response.data is the LeaderboardResponse
      const response = await apiGet<LeaderboardResponse['data']>(url);
      
      const leaderboardResponse: LeaderboardResponse = {
        success: response.success ?? true,
        message: response.message || 'Weekly streak leaderboard retrieved successfully',
        data: response.data!,
        timestamp: response.timestamp || new Date().toISOString(),
      };

      return leaderboardResponse;
    } catch (error: any) {
      console.error('[LeaderboardService] Error fetching weekly streak leaderboard:', error);
      throw new Error(error.message || 'Failed to fetch weekly streak leaderboard');
    }
  }

  /**
   * Get leaderboard by type
   * Caching is now handled by React Query in the useLeaderboard hook
   */
  static async getLeaderboard(type: LeaderboardType): Promise<LeaderboardResponse> {
    switch (type) {
      case 'POINTS':
        return this.getPointsLeaderboard();
      case 'LEVELS':
        return this.getLevelsLeaderboard();
      case 'WEEKLY_STREAK':
        return this.getWeeklyStreakLeaderboard();
      default:
        throw new Error(`Unknown leaderboard type: ${type}`);
    }
  }
}
