import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, buildURL } from '@/config/api';
import { ApiResponse, ApiError } from '@/types/api';

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL.development, // Will be dynamic based on environment
    timeout: API_CONFIG.REQUEST.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Configure retry logic
  axiosRetry(client, {
    retries: API_CONFIG.REQUEST.RETRY_ATTEMPTS,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      // Retry on network errors or 5xx status codes
      return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
             ((error.response?.status ?? 0) >= 500 && (error.response?.status ?? 0) < 600);
    },
  });

  return client;
};

// Global API client instance
let apiClient: AxiosInstance;

// Initialize API client
export const initializeApiClient = (): AxiosInstance => {
  if (!apiClient) {
    apiClient = createApiClient();
    setupInterceptors(apiClient);
  }
  return apiClient;
};

// Setup request/response interceptors
const setupInterceptors = (client: AxiosInstance): void => {
  // Request interceptor - Add auth token
  client.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem(API_CONFIG.STORAGE.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get auth token:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle errors
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error) => {
      // Handle 401 Unauthorized - Token expired
      if (error.response?.status === 401) {
        // Clear stored token and redirect to login
        try {
          await AsyncStorage.removeItem(API_CONFIG.STORAGE.ACCESS_TOKEN);
          // You might want to emit an event or use a navigation service here
          console.log('Token expired, redirecting to login');
        } catch (clearError) {
          console.error('Failed to clear auth token:', clearError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// Utility functions
export const setAuthToken = async (accessToken: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(API_CONFIG.STORAGE.ACCESS_TOKEN, accessToken);
  } catch (error) {
    console.error('Failed to set auth token:', error);
  }
};

export const clearAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(API_CONFIG.STORAGE.ACCESS_TOKEN);
  } catch (error) {
    console.error('Failed to clear auth token:', error);
  }
};

// Generic API request function
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const client = initializeApiClient();
  
  try {
    const response = await client.request<ApiResponse<T>>(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        success: false,
        message: error.response?.data?.message || error.message || 'An error occurred',
        error: error.response?.data?.error || error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
        path: error.config?.url || '',
        status: error.response?.status || 0,
      };
      throw apiError;
    }
    throw error;
  }
};

// HTTP method helpers
export const apiGet = <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return apiRequest<T>({ ...config, method: 'GET', url });
};

export const apiPost = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return apiRequest<T>({ ...config, method: 'POST', url, data });
};

export const apiPut = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return apiRequest<T>({ ...config, method: 'PUT', url, data });
};

export const apiDelete = <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return apiRequest<T>({ ...config, method: 'DELETE', url });
};

// Export the initialized client
export const getApiClient = (): AxiosInstance => {
  return initializeApiClient();
};