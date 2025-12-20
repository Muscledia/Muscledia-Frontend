import * as React from 'react';
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginResponse } from '@/types';
import { AuthService } from '@/services';


type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshAuth: () => Promise<void>;
  // ADDED: Access to login response data
  loginData: LoginResponse | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'muscledia_users';
const CURRENT_USER_KEY = 'muscledia_current_user';

// Simple email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loginData, setLoginData] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking authentication status...');
      const isAuth = await AuthService.isAuthenticated();

      if (isAuth) {
        console.log('User has valid token');
        // Note: We don't have user data here since we only stored the token
        // You might want to fetch user profile from an endpoint or decode the JWT
      } else {
        console.log('User is not authenticated');
        setUser(null);
        setLoginData(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setLoginData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (currentUserData) {
        const userData = JSON.parse(currentUserData);
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const getUsersFromStorage = async (): Promise<any[]> => {
    try {
      const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('Failed to get users:', error);
      return [];
    }
  };

  const saveUsersToStorage = async (users: any[]) => {
    try {
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('useAuth: Attempting login for username:', username);

      // Use your backend AuthService with actual response handling
      const loginResponse: LoginResponse = await AuthService.login(username, password);

      console.log('useAuth: Login response received:', loginResponse);

      // Store the login response data
      setLoginData(loginResponse);

      // Convert LoginResponse to User object using the actual backend format
      const userObj: User = AuthService.loginResponseToUser(loginResponse);

      setUser(userObj);

      console.log('useAuth: Login successful for user:', loginResponse.username);
      console.log('useAuth: User object created:', userObj);

      return { success: true };

    } catch (error: any) {
      console.error('useAuth: Login failed:', error);
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

      // Use your backend AuthService
      const registeredUser: User = await AuthService.register(userData);

      setUser(registeredUser);
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
      console.log('useAuth: Logging out user...');
      await AuthService.logout();
      setUser(null);
      setLoginData(null);
      console.log('useAuth: Logout successful');
    } catch (error) {
      console.error('useAuth: Logout error:', error);
      // Still clear user state even if logout fails
      setUser(null);
      setLoginData(null);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      console.log('useAuth: Updating user profile...');
      // Here you would call an API endpoint to update user profile
      // const updatedUser = await AuthService.updateProfile(updates);

      // For now, just update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
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
    loginData, // Expose login data for access to token, roles, etc.
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
