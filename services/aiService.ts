import { apiPost } from './api';
import { API_CONFIG, buildURL } from '@/config/api';
import { ApiResponse, AiRecommendationRequest, AiRecommendationResponse } from '@/types/api';

/**
 * AiService
 * Handles calls to the AI recommendation endpoint.
 */
export class AiService {
  /**
   * Request an AI-generated workout recommendation.
   * @param payload frequency 1-6 and training level (BEGINNER | INTERMEDIATE | ADVANCED)
   */
  static async getRecommendation(
    payload: AiRecommendationRequest
  ): Promise<ApiResponse<AiRecommendationResponse>> {
    const url = buildURL(API_CONFIG.ENDPOINTS.AI.GET_RECOMMENDATION);

    return apiPost<AiRecommendationResponse>(url, payload, {
      timeout: API_CONFIG.REQUEST.AI_TIMEOUT,
    });
  }
}

