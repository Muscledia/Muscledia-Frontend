import { apiPost, setAuthToken, clearAuthToken } from './api';
import { API_CONFIG, buildURL, getDebugInfo } from '@/config/api';
import { LoginRequest, LoginResponse, RegisterRequest, User, ApiResponse } from '@/types';

import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthService {
  /**
   * Login with enhanced response handling
   */
  static async login(username: string, password: string): Promise<LoginResponse> {
    console.log('=== LOGIN START ===');
    console.log('Attempting login for username:', username);

    try {
      const url = buildURL(API_CONFIG.ENDPOINTS.AUTH.LOGIN);
      console.log('Login URL:', url);

      const credentials: LoginRequest = {
        username: username.trim(),
        password: password
      };

      // Use your axios-based apiPost function
      const response: ApiResponse<LoginResponse> = await apiPost<LoginResponse>(url, credentials);
      console.log('Raw login response:', JSON.stringify(response, null, 2));

      let loginData: LoginResponse;
      // Handle ApiResponse wrapper format (from your axios setup)
      if (response.success && response.data) {
        console.log('Found ApiResponse wrapper format');
        loginData = response.data;
      }else if ((response as any).token && (response as any).username) {
        console.log('Direct response format detected');
        loginData = response as unknown as LoginResponse;
      }
      else {
        console.error('Unexpected login response format:', response);
        throw new Error('Invalid login response format');
      }


      // Validate required fields
      if (!loginData.token || !loginData.username || !loginData.userId) {
        console.error('Missing required login fields:', loginData);
        throw new Error('Invalid login response - missing required fields');
      }

      // Store the token
      await setAuthToken(loginData.token);
      console.log('Login token stored successfully');

      console.log('Login successful for user:', loginData.username);
      console.log('User ID:', loginData.userId);
      console.log('UUID:', loginData.uuidString);
      console.log('Roles:', loginData.roles);

      return loginData;

    } catch (error: any) {
      console.error('Login error:', error);

      if (error.status === 401) {
        throw new Error('Invalid username or password. Please try again.');
      } else if (error.status === 403) {
        throw new Error('Account is disabled. Please contact support.');
      } else if (error.status === 404) {
        throw new Error('Username not found. Please check your username or register.');
      } else if (error.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Login timed out. Please try again.');
      } else if (error.message?.includes('Network')) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
  }

  /**
   * Register a new user
   */
  static async register(userData: RegisterRequest): Promise<User> {
    console.log('=== REGISTRATION START ===');
    console.log('Registration data:', JSON.stringify(userData, null, 2));

    try {
      const url = buildURL(API_CONFIG.ENDPOINTS.AUTH.REGISTER);
      console.log('Registration URL:', url);

      const response = await apiPost<User>(url, userData);
      console.log('Raw registration response:', JSON.stringify(response, null, 2));

      // Extract user data from response
      const user = this.extractUserFromResponse(response);
      console.log('Registration successful for user:', user.username);

      return user;

    } catch (error: any) {
      console.error('Registration error:', error);

      if (error.status >= 400 && error.status < 500) {
        throw new Error(error.message || 'Registration failed. Please check your information.');
      } else if (error.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      } else if (error.message?.includes('Network')) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    }
  }

  /**
   * Convert LoginResponse to User object
   */
  static loginResponseToUser(loginResponse: LoginResponse): {
    uuidString: string;
    goalType: string;
    createdAt: string;
    gender: string;
    roles: string[];
    weight: number;
    id: number;
    birthDate: string;
    email: string;
    username: string;
    height: number;
    updatedAt: string
  } {
    return {
      id: parseInt(loginResponse.userId), // Convert string to number
      username: loginResponse.username,
      email: '', // Not provided in login response
      birthDate: '',
      gender: '',
      height: 0,
      weight: 0,
      goalType: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uuidString: loginResponse.uuidString,
      roles: loginResponse.roles,
    };
  }

  /**
   * Logout user and clear all authentication data
   */
  static async logout(): Promise<void> {
    try {
      console.log('AuthService: Clearing authentication data...');

      // Clear auth token
      await clearAuthToken();

      // Clear any stored user data
      await AsyncStorage.removeItem(API_CONFIG.STORAGE.ACCESS_TOKEN);
      await AsyncStorage.removeItem('muscledia_current_user');

      console.log('AuthService: Logout completed successfully');
    } catch (error) {
      console.error('AuthService: Logout error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(API_CONFIG.STORAGE.ACCESS_TOKEN);
      return token !== null && token.length > 0;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  /**
   * Get current auth token
   */
  static async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(API_CONFIG.STORAGE.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Extract user data from registration response
   */
  private static extractUserFromResponse(response: any): User {
    console.log('Extracting user from response...');

    if (response.success && response.data) {
      console.log('Found ApiResponse wrapper format');
      return this.normalizeUserData(response.data);
    }

    if (response.id || response.userId || response.username) {
      console.log('Found direct user object format');
      return this.normalizeUserData(response);
    }

    if (response.token && response.user) {
      console.log('Found token + user format');
      return this.normalizeUserData(response.user);
    }

    console.error('Unknown user response format:', response);
    throw new Error('Unexpected response format from server');
  }

  /**
   * Normalize user data to consistent format
   */
  private static normalizeUserData(userData: any): User {
    return {
      id: userData.id || userData.userId,
      username: userData.username,
      email: userData.email,
      birthDate: userData.birthDate,
      gender: userData.gender,
      height: userData.height,
      weight: userData.weight || userData.initialWeight,
      goalType: userData.goalType,
      createdAt: userData.createdAt || userData.registrationDate || new Date().toISOString(),
      updatedAt: userData.updatedAt || new Date().toISOString(),
    };
  }

  /**
   * Get debug information
   */
  static getDebugInfo() {
    return {
      ...getDebugInfo(),
      endpoints: API_CONFIG.ENDPOINTS,
      timeout: API_CONFIG.REQUEST.TIMEOUT,
      storage: API_CONFIG.STORAGE,
    };
  }
}
