import { Platform } from 'react-native';

const getApiBaseUrl = (): string => {
  // Check for environment variable first (for team development)
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android emulator
      return 'http://10.0.2.2:8080';
    } else if (Platform.OS === 'ios') {
      // iOS simulator
      return 'http://localhost:8080';
    } else {
      // Physical device - use your computer's actual IP
      return 'http://192.168.1.64:8080'; // <== Your actual IP
    }
  }

  // Production
  return 'https://api.muscledia.com';
};



// API Configuration
export const API_CONFIG = {
  // Dynamic base URL
  BASE_URL: getApiBaseUrl(),

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

    // Routine Folders
    ROUTINE_FOLDERS: {
      PUBLIC: '/api/v1/routine-folders/public',
      GET_BY_ID: (id: string) => `/api/v1/routine-folders/${id}`,
    },
  },

  // Request configuration
  REQUEST: {
    TIMEOUT: 30000, // Increased to 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },

  // Storage keys
  STORAGE: {
    ACCESS_TOKEN: 'muscledia_access_token',
    USER_DATA: 'muscledia_user_data',
    OFFLINE_DATA: 'muscledia_offline_data',
  },
};

// Environment detection
// export const getBaseURL = (): string => {
//   const env = __DEV__ ? 'development' : 'production';
//   return API_CONFIG.BASE_URL[env];
// };

// Full URL builder
// export const buildURL = (endpoint: string): string => {
//   return `${getBaseURL()}${endpoint}`;
// };

export const buildURL = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getDebugInfo = () => ({
  baseUrl: API_CONFIG.BASE_URL,
  platform: Platform.OS,
  isDev: __DEV__,
  loginUrl: buildURL(API_CONFIG.ENDPOINTS.AUTH.LOGIN),
  registerUrl: buildURL(API_CONFIG.ENDPOINTS.AUTH.REGISTER),
});
