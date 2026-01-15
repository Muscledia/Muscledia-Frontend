import { Platform } from 'react-native';

const getApiBaseUrl = (): string => {
  // Check for environment variable first
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    console.log('Using API URL from environment:', envApiUrl);
    // FIX: Ensure port is included
    if (envApiUrl.includes('89.168.117.65') && !envApiUrl.includes(':')) {
      const fixedUrl = 'http://89.168.117.65:8080';
      console.log('Fixed URL to include port:', fixedUrl);
      return fixedUrl;
    }
    return envApiUrl;
  }

  // Development URLs
  if (__DEV__) {
    // When testing on physical iOS device with remote server
    if (Platform.OS === 'ios') {
      // Use production server for remote testing on iOS device
      return 'http://89.168.117.65:8080';
    }
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080';
    }
    // Web/other
    return 'http://192.168.1.64:8080';
  }

  // Production
  return 'http://89.168.117.65:8080';
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENV || (__DEV__ ? 'development' : 'production'),

  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/users/login',
      REGISTER: '/api/users/register',
    },
    USER: {
      UPDATE_PROFILE: '/api/users/me',
      GET_USER: (id: string) => `/api/users/${id}`,
    },
    AI: {
      GET_RECOMMENDATION: '/ollama/getRecommendation',
    },
    WORKOUT: {
      GET_EXERCISES: '/api/v1/exercises',
      GET_WORKOUT_PLANS: '/api/v1/workout-plans',
      GET_ROUTINE_FOLDERS: '/api/v1/routine-folders',
      CREATE_WORKOUT_SESSION: '/api/v1/workout-sessions',
    },
    GAMIFICATION: {
      GET_ACHIEVEMENTS: '/api/gamification/achievements',
      GET_BADGES: '/api/gamification/badges',
      GET_LEADERBOARD: '/api/gamification/leaderboard',
      GET_LEADERBOARD_POINTS: '/api/gamification/leaderboards/points',
      GET_LEADERBOARD_LEVELS: '/api/gamification/leaderboards/levels',
      GET_LEADERBOARD_WEEKLY_STREAK: '/api/gamification/leaderboards/weekly-streak',
    },
  },

  REQUEST: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    AI_TIMEOUT: 120000,
  },

  STORAGE: {
    ACCESS_TOKEN: 'muscledia_access_token',
    USER_DATA: 'muscledia_user_data',
    OFFLINE_DATA: 'muscledia_offline_data',
  },
};

// Full URL builder
export const buildURL = (endpoint: string): string => {
  const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log('Building URL:', fullUrl);
  return fullUrl;
};

// Debug information
export const getDebugInfo = () => {
  const info = {
    baseUrl: API_CONFIG.BASE_URL,
    platform: Platform.OS,
    isDev: __DEV__,
    environment: API_CONFIG.ENVIRONMENT,
    loginUrl: buildURL(API_CONFIG.ENDPOINTS.AUTH.LOGIN),
    registerUrl: buildURL(API_CONFIG.ENDPOINTS.AUTH.REGISTER),
    aiUrl: buildURL(API_CONFIG.ENDPOINTS.AI.GET_RECOMMENDATION),
  };

  console.log('=== API Debug Info ===');
  console.log(JSON.stringify(info, null, 2));

  return info;
};

// Log config on initialization
console.log('API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
if (!API_CONFIG.BASE_URL.includes(':8080') && API_CONFIG.BASE_URL.includes('89.168.117.65')) {
  console.error('❌ CRITICAL: BASE_URL missing port 8080!');
}
