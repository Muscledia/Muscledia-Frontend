import axios from 'axios';
                                                      //Set up robust HTTP Client
// 1. Create axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
});

// 2. Add request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = "bsdef";//getStoredToken();   //future function for storing bearer token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
      //await refreshToken();
    }
    return Promise.reject(error);
  }
);