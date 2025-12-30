import { apiGet, apiPost } from './api';
import { ApiResponse, Challenge, UserChallenge } from '@/types';

/**
 * Challenge Service
 * API service layer for challenge-related endpoints to communicate with the gamification service.
 */
const challengeService = {
  /**
   * Get available challenges by type (DAILY or WEEKLY)
   * @param type The type of challenges to retrieve ('DAILY' or 'WEEKLY')
   * @returns Promise resolving to ApiResponse containing an array of Challenge objects
   */
  getAvailableChallenges: async (
    type: 'DAILY' | 'WEEKLY'
  ): Promise<ApiResponse<Challenge[]>> => {
    return apiGet<Challenge[]>(`/api/challenges/available?type=${type}`);
  },

  /**
   * Get daily challenges (convenience method)
   * @returns Promise resolving to ApiResponse containing an array of daily Challenge objects
   */
  getDailyChallenges: async (): Promise<ApiResponse<Challenge[]>> => {
    return apiGet<Challenge[]>('/api/challenges/daily');
  },

  /**
   * Get weekly challenges (convenience method)
   * @returns Promise resolving to ApiResponse containing an array of weekly Challenge objects
   */
  getWeeklyChallenges: async (): Promise<ApiResponse<Challenge[]>> => {
    return apiGet<Challenge[]>('/api/challenges/weekly');
  },

  /**
   * Start a challenge for the current user
   * The user is determined from the authentication token
   * @param challengeId The ID of the challenge to start
   * @returns Promise resolving to ApiResponse containing the started UserChallenge object
   */
  startChallenge: async (challengeId: string): Promise<ApiResponse<UserChallenge>> => {
    return apiPost<UserChallenge>(`/api/challenges/${challengeId}/start`);
  },

  /**
   * Get user's active challenges
   * The user is determined from the authentication token
   * @returns Promise resolving to ApiResponse containing an array of UserChallenge objects
   */
  getActiveChallenges: async (): Promise<ApiResponse<UserChallenge[]>> => {
    return apiGet<UserChallenge[]>('/api/challenges/active');
  },
};

export default challengeService;

// Named export for backward compatibility with class-based usage
export const ChallengeService = challengeService;
