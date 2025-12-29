import { apiPost } from './api';
import { API_CONFIG, buildURL, getDebugInfo } from '@/config/api';
import { ApiResponse, AiRecommendationRequest, AiRecommendationResponse } from '@/types';

export class AiService {
  static async getRecommendation(
    payload: AiRecommendationRequest
  ): Promise<ApiResponse<AiRecommendationResponse>> {
    console.log('=== AI RECOMMENDATION REQUEST ===');
    console.log('Payload:', payload);

    // Debug: Print API configuration
    const debugInfo = getDebugInfo();
    console.log('Current BASE_URL:', API_CONFIG.BASE_URL);

    const url = buildURL(API_CONFIG.ENDPOINTS.AI.GET_RECOMMENDATION);
    console.log('Final Request URL:', url);

    // Verify the URL has port 8080
    if (!url.includes(':8080')) {
      console.error('⚠️ WARNING: URL does not include port 8080!');
      console.error('Expected: http://89.168.117.65:8080/ollama/getRecommendation');
      console.error('Got:', url);
    }

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
