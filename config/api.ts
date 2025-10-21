// API Configuration
export const API_CONFIG = {
  // Base URLs for different environments
  BASE_URL: {
    development: 'http://localhost:8080', // API Gateway      8080/api
    production: 'https://your-production-domain.com', // production url
  },
  
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
  },
  
  // Request configuration
  REQUEST: {
    TIMEOUT: 10000, // 10 seconds
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
export const getBaseURL = (): string => {
  const env = __DEV__ ? 'development' : 'production';
  return API_CONFIG.BASE_URL[env];
};

// Full URL builder
export const buildURL = (endpoint: string): string => {
  return `${getBaseURL()}${endpoint}`;
};
