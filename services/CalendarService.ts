import { apiGet } from './api';
import { ApiResponse } from '@/types';

/**
 * Calendar data structure
 * Maps date strings (YYYY-MM-DD) to workout counts
 */
export interface CalendarData {
  [date: string]: number;
}

/**
 * Calendar Service
 * Handles all calendar-related API calls for workout history
 */
export class CalendarService {
  /**
   * Get calendar data for date range
   * Returns map of dates to workout counts
   * @param startDate ISO-8601 format: "2024-01-01T00:00:00Z"
   * @param endDate ISO-8601 format: "2024-01-31T23:59:59Z"
   */
  static async getCalendarRange(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<CalendarData>> {
    console.log('Fetching calendar range:', { startDate, endDate });
    const response = await apiGet<CalendarData>('/api/v1/calendar', {
      params: { startDate, endDate }
    });
    return response;
  }

  /**
   * Get workout dates for a specific month
   * Returns array of dates (YYYY-MM-DD) that have workouts
   * @param year Year (2020-2100)
   * @param month Month (1-12)
   */
  static async getMonthWorkoutDates(
    year: number,
    month: number
  ): Promise<ApiResponse<string[]>> {
    console.log('Fetching month workout dates:', { year, month });
    const response = await apiGet<string[]>('/api/v1/calendar/month', {
      params: { year, month }
    });
    return response;
  }

  /**
   * Get total workout count for current month
   */
  static async getCurrentMonthCount(): Promise<ApiResponse<number>> {
    console.log('Fetching current month workout count');
    const response = await apiGet<number>('/api/v1/calendar/current-month-count');
    return response;
  }

  /**
   * Get workout count for a specific date
   * @param date Format: "YYYY-MM-DD"
   */
  static async getDateWorkoutCount(
    date: string
  ): Promise<ApiResponse<number>> {
    console.log('Fetching date workout count:', date);
    const response = await apiGet<number>('/api/v1/calendar/date', {
      params: { date }
    });
    return response;
  }
}

