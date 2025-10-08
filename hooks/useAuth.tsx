import * as React from 'react';
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateName: (name: string) => Promise<{ success: boolean; error?: string }>;
  updateEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'muscledia_users';
const CURRENT_USER_KEY = 'muscledia_current_user';

// Simple email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Hash password using expo-crypto
const hashPassword = async (password: string): Promise<string> => {
  const salt = Math.random().toString(36).substring(2, 15);
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + salt
  );
  return `${salt}:${hash}`;
};

// Verify password
const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const [salt, hash] = hashedPassword.split(':');
  const inputHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + salt
  );
  return inputHash === hash;
};

// Generate unique user ID
const generateUserId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load current user on app start
  useEffect(() => {
    loadCurrentUser();
  }, []);

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

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validation
      if (!email || !password || !name) {
        return { success: false, error: 'All fields are required' };
      }

      if (!isValidEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      if (name.trim().length < 2) {
        return { success: false, error: 'Name must be at least 2 characters long' };
      }

      // Check if user already exists
      const users = await getUsersFromStorage();
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (existingUser) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const newUser = {
        id: generateUserId(),
        email: email.toLowerCase(),
        name: name.trim(),
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      };

      // Save to users list
      users.push(newUser);
      await saveUsersToStorage(users);

      // Create user object for context (without password)
      const userForContext: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt,
      };

      // Set as current user
      await saveUser(userForContext);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      if (!isValidEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Find user
      const users = await getUsersFromStorage();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Create user object for context (without password)
      const userForContext: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      };

      // Set as current user
      await saveUser(userForContext);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };
      
      // Update in users storage
      const users = await getUsersFromStorage();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        await saveUsersToStorage(users);
      }

      // Update current user
      await saveUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  // Update only the display name with validation
  const updateName = async (name: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    const trimmed = name.trim();
    if (trimmed.length < 2) return { success: false, error: 'Name must be at least 2 characters long' };
    try {
      const updates: Partial<User> = { name: trimmed };
      await updateProfile(updates);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Failed to update name' };
    }
  };

  // Update email with validation and uniqueness check
  const updateEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    const normalized = email.trim().toLowerCase();
    if (!isValidEmail(normalized)) return { success: false, error: 'Please enter a valid email address' };
    try {
      const users = await getUsersFromStorage();
      const exists = users.find(u => u.email.toLowerCase() === normalized && u.id !== user.id);
      if (exists) return { success: false, error: 'An account with this email already exists' };
      // Update users storage
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], email: normalized };
        await saveUsersToStorage(users);
      }
      // Update current user
      await saveUser({ ...user, email: normalized });
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Failed to update email' };
    }
  };

  // Change password verifying the old one and saving the new hashed password
  const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    if (!oldPassword || !newPassword) return { success: false, error: 'Both fields are required' };
    if (newPassword.length < 6) return { success: false, error: 'Password must be at least 6 characters long' };
    try {
      const users = await getUsersFromStorage();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx === -1) return { success: false, error: 'User not found' };
      const currentUserRecord = users[idx];
      const ok = await verifyPassword(oldPassword, currentUserRecord.password);
      if (!ok) return { success: false, error: 'Current password is incorrect' };
      const hashedPassword = await hashPassword(newPassword);
      users[idx] = { ...currentUserRecord, password: hashedPassword };
      await saveUsersToStorage(users);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Failed to change password' };
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    updateName,
    updateEmail,
    changePassword,
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