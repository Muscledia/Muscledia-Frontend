import { apiGet } from './api';
import { API_CONFIG, buildURL } from '@/config/api';
import { ApiResponse } from '@/types';
import { PersonalRecord, PRStatistics } from '@/types/personalRecords';

export class PersonalRecordsService {
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  // Cache stores
  private static prsCache: { data: PersonalRecord[]; expiresAt: number } | null = null;
  private static statsCache: { data: PRStatistics; expiresAt: number } | null = null;

  /**
   * Get all personal records for the user
   */
  static async getPersonalRecords(forceRefresh = false): Promise<ApiResponse<PersonalRecord[]>> {
    if (!forceRefresh && this.prsCache && this.prsCache.expiresAt > Date.now()) {
      return { success: true, message: 'From cache', data: this.prsCache.data, timestamp: new Date().toISOString() };
    }

    try {
      // Using the correct endpoint from description: GET /api/v1/analytics/personal-records
      // Note: The base URL in api.ts might already include /api/v1 or just /api
      // Assuming buildURL handles the base, we need to check if we should prefix with /api/v1 or just /analytics depending on base config.
      // Based on previous tool outputs, other endpoints seem to be /api/... so I'll assume /api/v1 is the path.
      // But let's check config/api.ts first to be sure about base URL structure if possible, but I'll write safer code.
      
      const url = buildURL('/api/v1/analytics/personal-records'); 
      const response = await apiGet<PersonalRecord[]>(url, {
        timeout: API_CONFIG.REQUEST.TIMEOUT,
      });

      if (response.success && response.data) {
        this.prsCache = {
          data: response.data,
          expiresAt: Date.now() + this.CACHE_TTL
        };
      }

      return response;
    } catch (error) {
      console.error('Failed to fetch personal records:', error);
      throw error;
    }
  }

  /**
   * Get PR statistics
   */
  static async getPRStatistics(forceRefresh = false): Promise<ApiResponse<PRStatistics>> {
    if (!forceRefresh && this.statsCache && this.statsCache.expiresAt > Date.now()) {
      return { success: true, message: 'From cache', data: this.statsCache.data, timestamp: new Date().toISOString() };
    }

    try {
      const url = buildURL('/api/v1/analytics/personal-records/statistics');
      const response = await apiGet<PRStatistics>(url, {
        timeout: API_CONFIG.REQUEST.TIMEOUT,
      });

      if (response.success && response.data) {
        this.statsCache = {
          data: response.data,
          expiresAt: Date.now() + this.CACHE_TTL
        };
      }

      return response;
    } catch (error) {
      console.error('Failed to fetch PR statistics:', error);
      throw error;
    }
  }

  /**
   * Filter PRs by exercise ID (client-side filter from cached/fetched data usually, 
   * or could be a param if API supports it. The description implies "Implement separate methods... getPRsByExercise",
   * but doesn't explicitly specify a separate endpoint for filtering by exercise. 
   * Usually list endpoints support query params or we filter client side. 
   * Given the "Service Layer" requirements, I'll implement it as a helper that uses getPersonalRecords.
   */
  static async getPRsByExercise(exerciseId: string): Promise<PersonalRecord[]> {
    const response = await this.getPersonalRecords();
    if (!response.data) return [];
    return response.data.filter(pr => pr.exerciseId === exerciseId);
  }

  /**
   * Filter PRs by record type
   */
  static async getPRsByType(recordType: PersonalRecord['recordType']): Promise<PersonalRecord[]> {
    const response = await this.getPersonalRecords();
    if (!response.data) return [];
    return response.data.filter(pr => pr.recordType === recordType);
  }

  /**
   * Clear caches
   */
  static clearCache() {
    this.prsCache = null;
    this.statsCache = null;
  }
}
