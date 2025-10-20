import { apiPost } from './api';
import { API_CONFIG, buildURL } from '@/config/api';
import { LoginRequest, LoginResponse, RegisterRequest, User, ApiResponse } from '@/types/api';
import { setAuthTokens } from './api';

export class AuthService {
  /**
   * Authenticate user with username and password
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiPost<LoginResponse>(
      buildURL(API_CONFIG.ENDPOINTS.AUTH.LOGIN),
      credentials
    );

    if (response.success && response.data) {
      // Store tokens securely
      await setAuthTokens(response.data.token, response.data.refreshToken);
      return response.data;
    }

    throw new Error(response.message || 'Login failed');
  }

  /**
   * Register a new user
   */
  static async register(userData: RegisterRequest): Promise<User> {
    const response = await apiPost<User>(
      buildURL(API_CONFIG.ENDPOINTS.AUTH.REGISTER),
      userData
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Registration failed');
  }
}
