import * as React from 'react';
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginResponse } from '@/types';
import { AuthService } from '@/services';
import { router } from 'expo-router';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshAuth: () => Promise<void>;
  loginData: LoginResponse | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'muscledia_current_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loginData, setLoginData] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('useAuth: Checking authentication status...');
      const isAuth = await AuthService.isAuthenticated();

      if (isAuth) {
        console.log('useAuth: User has valid token');

        // Load stored user data if available
        await loadStoredUserData();

      } else {
        console.log('useAuth: User is not authenticated, redirecting to login...');

        // Clear state
        setUser(null);
        setLoginData(null);

        // Redirect to login
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('useAuth: Auth check failed:', error);

      // Clear state on error
      setUser(null);
      setLoginData(null);

      // Redirect to login
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStoredUserData = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (currentUserData) {
        const userData = JSON.parse(currentUserData);
        setUser(userData);
        console.log('useAuth: Loaded stored user data for:', userData.username);
      } else {
        console.log('useAuth: No stored user data found');
      }
    } catch (error) {
      console.error('useAuth: Failed to load stored user data:', error);
    }
  };

  const saveUserData = async (userData: User) => {
    try {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      console.log('useAuth: User data saved to storage');
    } catch (error) {
      console.error('useAuth: Failed to save user data:', error);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('useAuth: Attempting login for username:', username);

      // Authenticate through service
      const loginResponse: LoginResponse = await AuthService.login(username, password);
      console.log('useAuth: Login response received:', loginResponse);

      // Store login response data
      setLoginData(loginResponse);

      // Convert to User object
      const userObj: User = AuthService.loginResponseToUser(loginResponse);
      setUser(userObj);

      // Save user data to AsyncStorage
      await saveUserData(userObj);

      console.log('useAuth: Login successful for user:', loginResponse.username);
      return { success: true };

    } catch (error: any) {
      console.error('useAuth: Login failed:', error);

      // Clear state on failure
      setUser(null);
      setLoginData(null);

      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    }
  };

  const register = async (userData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('useAuth: Attempting registration for username:', userData.username);

      // Register through service
      const registeredUser: User = await AuthService.register(userData);

      setUser(registeredUser);

      // Save user data to AsyncStorage
      await saveUserData(registeredUser);

      console.log('useAuth: Registration successful for user:', registeredUser.username);
      return { success: true };

    } catch (error: any) {
      console.error('useAuth: Registration failed:', error);
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = async () => {
    try {
      console.log('useAuth: Initiating logout...');

      // Clear authentication data through service
      await AuthService.logout();

      // Clear local state
      setUser(null);
      setLoginData(null);

      console.log('useAuth: Logout successful, redirecting to login...');

      // Redirect to login screen
      router.replace('/(auth)/login');

    } catch (error) {
      console.error('useAuth: Logout error:', error);

      // Even if logout fails, clear local state and redirect
      setUser(null);
      setLoginData(null);
      router.replace('/(auth)/login');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      console.log('useAuth: Updating user profile...');

      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      // Save to AsyncStorage
      await saveUserData(updatedUser);

      console.log('useAuth: Profile updated successfully');
    } catch (error) {
      console.error('useAuth: Profile update error:', error);
    }
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!loginData,
    login,
    register,
    logout,
    updateProfile,
    refreshAuth,
    loginData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
