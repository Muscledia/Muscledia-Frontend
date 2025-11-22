import { apiGet, apiPost } from './api';
import { ApiResponse, Challenge, ActiveChallenge } from '@/types/api';

export class ChallengeService {
  /**
   * Fetch daily challenges
   */
  static async getDailyChallenges(): Promise<ApiResponse<Challenge[]>> {
    return apiGet<Challenge[]>('/api/challenges/daily');
  }

  /**
   * Fetch weekly challenges
   */
  static async getWeeklyChallenges(): Promise<ApiResponse<Challenge[]>> {
    return apiGet<Challenge[]>('/api/challenges/weekly');
  }

  /**
   * Fetch active challenges for the current user
   */
  static async getActiveChallenges(): Promise<ApiResponse<ActiveChallenge[]>> {
    return apiGet<ActiveChallenge[]>('/api/challenges/active');
  }

  /**
   * Start a challenge
   * @param challengeId The ID of the challenge to start
   */
  static async startChallenge(challengeId: string): Promise<ApiResponse<ActiveChallenge>> {
    return apiPost<ActiveChallenge>(`/api/challenges/${challengeId}/start`);
  }
}

