import { apiGet, apiPost } from './api';
import { ApiResponse, Challenge, ActiveChallenge } from '@/types';

export class ChallengeService {
  /**
   * Fetch daily challenges
   */
  static async getDailyChallenges(): Promise<ApiResponse<Challenge[]>> {
    // Assuming backend supports filtering by type via query param
    return apiGet<Challenge[]>('/api/quests?type=DAILY');
  }

  /**
   * Fetch weekly challenges
   */
  static async getWeeklyChallenges(): Promise<ApiResponse<Challenge[]>> {
    return apiGet<Challenge[]>('/api/quests?type=WEEKLY');
  }

  /**
   * Fetch all challenges (quests)
   */
  static async getAllChallenges(): Promise<ApiResponse<Challenge[]>> {
    return apiGet<Challenge[]>('/api/quests');
  }

  /**
   * Fetch active challenges for the current user
   * @param userId The ID of the user
   */
  static async getActiveChallenges(userId: string | number): Promise<ApiResponse<ActiveChallenge[]>> {
    return apiGet<ActiveChallenge[]>(`/api/quests/user/${userId}/active`);
  }

  /**
   * Start a challenge (quest)
   * @param challengeId The ID of the challenge to start
   * @param userId The ID of the user
   */
  static async startChallenge(challengeId: string, userId: string | number): Promise<ApiResponse<ActiveChallenge>> {
    return apiPost<ActiveChallenge>(`/api/quests/${challengeId}/start/${userId}`);
  }

  /**
   * Complete a challenge
   * @param challengeId The ID of the challenge
   * @param userId The ID of the user
   */
  static async completeChallenge(challengeId: string, userId: string | number): Promise<ApiResponse<any>> {
    return apiPost<any>(`/api/quests/${challengeId}/complete/${userId}`);
  }

  /**
   * Update challenge progress
   * @param challengeId The ID of the challenge (quest ID)
   * @param progress The new progress value or increment
   * @param userId The ID of the user (optional if handled by backend session, but likely needed)
   */
  static async updateChallengeProgress(challengeId: string, progress: number): Promise<ApiResponse<any>> {
     // The endpoint is PUT /api/quests/{questId}/progress
     // It likely expects a body with progress value.
     // I'll assume { progress: number }
     return apiPost<any>(`/api/quests/${challengeId}/progress`, { progress });
  }
}
