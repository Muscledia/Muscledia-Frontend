import { Platform } from 'react-native';

const getApiBaseUrl = (): string => {
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  if (__DEV__) {
    if (Platform.OS === 'ios') {
      return 'https://api.muscledia.fitness';
    }
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080';
    }
    return 'http://192.168.1.64:8080';
  }

  return 'https://api.muscledia.fitness';
};

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
      GET_COIN_BALANCE: '/api/gamification/coins/balance',
      SPEND_COINS: '/api/gamification/coins/spend',
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

export const buildURL = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
