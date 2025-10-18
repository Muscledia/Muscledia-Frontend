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

  // Response interceptor - Handle token refresh and errors
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized - Token expired
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = await AsyncStorage.getItem(API_CONFIG.STORAGE.REFRESH_TOKEN);
          if (refreshToken) {
            const response = await client.post(buildURL('/api/users/refresh'), {
              refreshToken,
            });

            const { token, refreshToken: newRefreshToken } = response.data.data;
            
            await AsyncStorage.setItem(API_CONFIG.STORAGE.ACCESS_TOKEN, token);
            await AsyncStorage.setItem(API_CONFIG.STORAGE.REFRESH_TOKEN, newRefreshToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          await clearAuthTokens();
          // You might want to emit an event or use a navigation service here
          console.error('Token refresh failed:', refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// Utility functions    -- maybe could be useful in the future for log out feature
export const clearAuthTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      API_CONFIG.STORAGE.ACCESS_TOKEN,
      API_CONFIG.STORAGE.REFRESH_TOKEN,
    ]);
  } catch (error) {
    console.error('Failed to clear auth tokens:', error);
  }
};

export const setAuthTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      [API_CONFIG.STORAGE.ACCESS_TOKEN, accessToken],
      [API_CONFIG.STORAGE.REFRESH_TOKEN, refreshToken],
    ]);
  } catch (error) {
    console.error('Failed to set auth tokens:', error);
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