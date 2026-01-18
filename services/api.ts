import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, buildURL } from '@/config/api';
import { ApiResponse, ApiError } from '@/types';
import { router } from 'expo-router';

/**
 * API Client Service
 * Handles all HTTP communication with the backend services
 *
 * Features:
 * - Automatic retry on network errors
 * - JWT token management
 * - Standardized error handling
 * - Support for both wrapped and unwrapped API responses
 * - Automatic logout and redirect on 401 errors
 */

// Global API client instance
let apiClient: AxiosInstance;

/**
 * Create axios instance with default configuration
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.REQUEST.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Configure retry logic for network errors and server errors
  axiosRetry(client, {
    retries: API_CONFIG.REQUEST.RETRY_ATTEMPTS,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      // Don't retry on 401 (authentication errors)
      if (error.response?.status === 401) {
        return false;
      }

      // Retry on network errors or 5xx status codes
      return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        ((error.response?.status ?? 0) >= 500 && (error.response?.status ?? 0) < 600);
    },
  });

  return client;
};

/**
 * Initialize API client (singleton pattern)
 */
export const initializeApiClient = (): AxiosInstance => {
  if (!apiClient) {
    apiClient = createApiClient();
    setupInterceptors(apiClient);
  }
  return apiClient;
};

/**
 * Setup request/response interceptors
 */
const setupInterceptors = (client: AxiosInstance): void => {
  // Request interceptor - Add JWT token to requests
  client.interceptors.request.use(
    async (config) => {
      try {
        // Get stored JWT token
        const token = await AsyncStorage.getItem(API_CONFIG.STORAGE.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request details (only in development)
        if (__DEV__) {
          console.log('→ Request:', config.method?.toUpperCase(), config.url);
          if (config.data) {
            console.log('→ Request data:', config.data);
          }
        }
      } catch (error) {
        console.warn('Failed to get auth token:', error);
      }
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle successful responses and errors
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response details (only in development)
      if (__DEV__) {
        console.log('← Response:', response.status, response.config.url);
        if (response.data) {
          console.log('← Response data:', response.data);
        }
      }
      return response;
    },
    async (error) => {
      if (__DEV__) {
        console.error('← Response error:', error.response?.status, error.message);
      }

      // Handle 401 Unauthorized - Token expired or invalid
      if (error.response?.status === 401) {
        console.log('API: 401 Unauthorized - Token expired or invalid');

        try {
          // Clear all authentication data
          await clearAuthToken();
          await AsyncStorage.removeItem('muscledia_current_user');

          console.log('API: Auth data cleared, redirecting to login...');

          // Redirect to login screen
          router.replace('/(auth)/login');

        } catch (clearError) {
          console.error('API: Failed to clear auth data:', clearError);
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Store JWT token in AsyncStorage
 */
export const setAuthToken = async (accessToken: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(API_CONFIG.STORAGE.ACCESS_TOKEN, accessToken);
    console.log('✓ Auth token stored successfully');
  } catch (error) {
    console.error('✗ Failed to set auth token:', error);
  }
};

/**
 * Clear JWT token from AsyncStorage
 */
export const clearAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(API_CONFIG.STORAGE.ACCESS_TOKEN);
    console.log('✓ Auth token cleared successfully');
  } catch (error) {
    console.error('✗ Failed to clear auth token:', error);
  }
};

/**
 * Get stored JWT token
 */
export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(API_CONFIG.STORAGE.ACCESS_TOKEN);
  } catch (error) {
    console.error('Failed to get stored token:', error);
    return null;
  }
};

/**
 * Generic API request function
 * Handles both wrapped ApiResponse format and direct data responses
 */
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const client = initializeApiClient();

  try {
    const response = await client.request<any>(config);
    const data = response.data;

    // Handle different response formats from backend

    // Format 1: Standard ApiResponse wrapper { success, data, message, timestamp }
    if (typeof data === 'object' && data !== null && 'success' in data) {
      return {
        success: data.success ?? true,
        message: data.message,
        data: data.data as T,
        timestamp: data.timestamp || new Date().toISOString(),
        status: response.status
      };
    }

    // Format 2: Direct data response (e.g., AI service returns WorkoutRecommendation directly)
    // Wrap it in ApiResponse format for consistency
    return {
      success: true,
      message: 'Request successful',
      data: data as T,
      timestamp: new Date().toISOString(),
      status: response.status
    };

  } catch (error) {
    if (__DEV__) {
      console.error('✗ API Request failed:', error);
    }

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        success: false,
        message: error.response?.data?.message || error.message || 'An error occurred',
        error: error.response?.data?.error || error.code || 'Unknown error',
        timestamp: new Date().toISOString(),
        path: error.config?.url || '',
        status: error.response?.status || 0,
      };

      // Add detailed error info in development
      if (__DEV__ && error.response?.data) {
        apiError.details = error.response.data;
      }

      throw apiError;
    }

    // Handle non-axios errors
    const genericError: ApiError = {
      success: false,
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      path: config.url || '',
      status: 0,
    };

    throw genericError;
  }
};

/**
 * HTTP GET request
 */
export const apiGet = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    ...config,
    method: 'GET',
    url
  });
};

/**
 * HTTP POST request
 */
export const apiPost = <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    ...config,
    method: 'POST',
    url,
    data
  });
};

/**
 * HTTP PUT request
 */
export const apiPut = <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    ...config,
    method: 'PUT',
    url,
    data
  });
};

/**
 * HTTP PATCH request
 */
export const apiPatch = <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    ...config,
    method: 'PATCH',
    url,
    data
  });
};

/**
 * HTTP DELETE request
 */
export const apiDelete = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    ...config,
    method: 'DELETE',
    url
  });
};

/**
 * Get the initialized API client instance
 * Useful for advanced use cases
 */
export const getApiClient = (): AxiosInstance => {
  return initializeApiClient();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getStoredToken();
  return token !== null;
};

/**
 * Upload file with multipart/form-data
 */
export const apiUpload = async <T>(
  url: string,
  formData: FormData,
  onUploadProgress?: (progressEvent: any) => void
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};
