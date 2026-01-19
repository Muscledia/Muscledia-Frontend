import { apiPost } from './api';
import { API_CONFIG, buildURL} from '@/config/api';
import { ApiResponse, AiRecommendationRequest, AiRecommendationResponse } from '@/types';

export class AiService {
  static async getRecommendation(
    payload: AiRecommendationRequest
  ): Promise<ApiResponse<AiRecommendationResponse>> {
    console.log('=== AI RECOMMENDATION REQUEST ===');
    console.log('Payload:', payload);

    const url = buildURL(API_CONFIG.ENDPOINTS.AI.GET_RECOMMENDATION);
    console.log('Final Request URL:', url);


    try {
      const response = await apiPost<AiRecommendationResponse>(url, payload, {
        timeout: API_CONFIG.REQUEST.AI_TIMEOUT,
      });

      console.log('✓ AI Response received:', response);
      return response;

    } catch (error: any) {
      console.error('✗ AI Recommendation Error:', error);
      throw error;
    }
  }
}
