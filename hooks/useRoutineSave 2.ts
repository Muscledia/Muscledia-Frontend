import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { RoutineService } from '@/services';
import { useAuth } from './useAuth';
import { ApiError } from '@/types/api';

interface UseRoutineSaveResult {
  isSaving: boolean;
  isSaved: boolean;
  isCheckingStatus: boolean;
  error: string | null;
  saveRoutine: () => Promise<void>;
  checkSaveStatus: () => Promise<void>;
}

/**
 * Custom hook for managing routine save functionality
 * Handles authentication, API calls, error handling, and state management
 */
export const useRoutineSave = (
  routineId: string,
  routineName: string
): UseRoutineSaveResult => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if routine is already saved on mount
  useEffect(() => {
    if (isAuthenticated && routineId) {
      checkSaveStatus();
    }
  }, [routineId, isAuthenticated]);

  /**
   * Check if the routine is already saved by the user
   */
  const checkSaveStatus = async () => {
    if (!isAuthenticated) return;

    try {
      setIsCheckingStatus(true);
      const response = await RoutineService.isRoutineSaved(routineId);
      
      if (response.success && response.data) {
        setIsSaved(response.data.isSaved);
      }
    } catch (err: any) {
      // Silently fail for status check - not critical
      console.warn('Failed to check save status:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  /**
   * Save the routine to user's collection
   */
  const saveRoutine = async () => {
    // Check authentication first
    if (!isAuthenticated || !user) {
      Alert.alert(
        'Login Required',
        'You need to be logged in to save routines to your collection.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => router.push('/(auth)/login'),
          },
        ]
      );
      return;
    }

    // Confirm save action
    Alert.alert(
      'Save Routine',
      `Add "${routineName}" to your personal collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async () => {
            await performSave();
          },
        },
      ]
    );
  };

  /**
   * Perform the actual save operation
   */
  const performSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await RoutineService.savePublicRoutine(routineId);

      if (response.success && response.data) {
        setIsSaved(true);
        
        // Show success message
        Alert.alert(
          'Success!',
          response.data.message || `"${routineName}" has been saved to your routines.`,
          [
            { text: 'OK' },
            {
              text: 'View My Routines',
              onPress: () => router.push('/(tabs)'),
            },
          ]
        );
      } else {
        throw new Error(response.message || 'Failed to save routine');
      }
    } catch (err: any) {
      console.error('Error saving routine:', err);
      handleSaveError(err);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle various save errors
   */
  const handleSaveError = (err: any) => {
    const apiError = err as ApiError;
    
    // Handle specific status codes
    if (apiError.status) {
      switch (apiError.status) {
        case 401:
          // Unauthorized - prompt login
          setError('Authentication required');
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log in again.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Login',
                onPress: () => router.push('/(auth)/login'),
              },
            ]
          );
          break;

        case 409:
          // Conflict - already saved
          setError('Already saved');
          setIsSaved(true);
          Alert.alert(
            'Already Saved',
            `"${routineName}" is already in your collection.`,
            [
              { text: 'OK' },
              {
                text: 'View My Routines',
                onPress: () => router.push('/(tabs)'),
              },
            ]
          );
          break;

        case 404:
          // Not found
          setError('Routine not found');
          Alert.alert(
            'Routine Unavailable',
            'This routine is no longer available.',
            [{ text: 'OK' }]
          );
          break;

        default:
          // Generic error
          setError(apiError.message || 'Failed to save routine');
          Alert.alert(
            'Error',
            apiError.message || 'Failed to save routine. Please try again.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Retry',
                onPress: () => saveRoutine(),
              },
            ]
          );
      }
    } else {
      // Network or other errors
      setError('Network error');
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Please check your internet connection and try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Retry',
            onPress: () => saveRoutine(),
          },
        ]
      );
    }
  };

  return {
    isSaving,
    isSaved,
    isCheckingStatus,
    error,
    saveRoutine,
    checkSaveStatus,
  };
};

