import { Platform } from 'react-native';

const getApiBaseUrl = (): string => {
  // Check for environment variable first
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    console.log('Using API URL from environment:', envApiUrl);
    return envApiUrl;
  }

  // Fallback to automatic detection
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8085';
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:8085';
    } else {
      return 'http://192.168.1.64:8085';
    }
  }

  return 'http://89.168.117.65';
};

// API Configuration
export const API_CONFIG = {
  // Dynamic base URL
  BASE_URL: getApiBaseUrl(),
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENV || (__DEV__ ? 'development' : 'production'),

  // Service endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/api/users/login',
      REGISTER: '/api/users/register',
    },

    // User Management
    USER: {
      UPDATE_PROFILE: '/api/users/me',
      GET_USER: (id: string) => `/api/users/${id}`,
    },

    // AI Service
    AI: {
      GET_RECOMMENDATION: '/ollama/getRecommendation',
    },

    // Workout Service (if you want direct access)
    WORKOUT: {
      GET_EXERCISES: '/api/v1/exercises',
      GET_WORKOUT_PLANS: '/api/v1/workout-plans',
      GET_ROUTINE_FOLDERS: '/api/v1/routine-folders',
      CREATE_WORKOUT_SESSION: '/api/v1/workout-sessions',
    },

    // Gamification Service
    GAMIFICATION: {
      GET_ACHIEVEMENTS: '/api/gamification/achievements',
      GET_BADGES: '/api/gamification/badges',
      GET_LEADERBOARD: '/api/gamification/leaderboard',
    },
  },

  // Request configuration
  REQUEST: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    AI_TIMEOUT: 120000, // AI endpoint can take up to 2 minutes
  },

  // Storage keys
  STORAGE: {
    ACCESS_TOKEN: 'muscledia_access_token',
    USER_DATA: 'muscledia_user_data',
    OFFLINE_DATA: 'muscledia_offline_data',
  },
};

// Full URL builder
export const buildURL = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Debug information
export const getDebugInfo = () => ({
  baseUrl: API_CONFIG.BASE_URL,
  platform: Platform.OS,
  isDev: __DEV__,
  loginUrl: buildURL(API_CONFIG.ENDPOINTS.AUTH.LOGIN),
  registerUrl: buildURL(API_CONFIG.ENDPOINTS.AUTH.REGISTER),
});
