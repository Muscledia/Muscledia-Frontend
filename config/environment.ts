// Environment Configuration
export const ENV = {
  // API Configuration
  API_BASE_URL: __DEV__ 
    ? 'http://localhost:8080'  // Development - API Gateway
    : 'https://your-production-domain.com', // Production


  // Cache Configuration
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    LONG_TTL: 30 * 60 * 1000,   // 30 minutes
    SHORT_TTL: 1 * 60 * 1000,   // 1 minute
  },

  // Request Configuration
  REQUEST: {
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },

  // Storage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'muscledia_access_token',
    REFRESH_TOKEN: 'muscledia_refresh_token',
    USER_DATA: 'muscledia_user_data',
    OFFLINE_DATA: 'muscledia_offline_data',
    CACHE_DATA: 'muscledia_cache_data',
  },
};

// Development helpers
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;