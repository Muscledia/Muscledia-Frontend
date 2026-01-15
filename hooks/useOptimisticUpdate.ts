// hooks/useOptimisticUpdate.ts
import { Alert } from 'react-native';
import { useHaptics } from './useHaptics';

export function useOptimisticUpdate<T>() {
  const { impact } = useHaptics();

  return async (
    currentState: T,
    optimisticState: T,
    setState: (state: T) => void,
    apiCall: () => Promise<any>
  ) => {
    // 1. Snapshot for rollback
    const snapshot = currentState;

    // 2. Optimistic update
    setState(optimisticState);
    await impact('medium');

    try {
      // 3. API call
      const response = await apiCall();

      if (!response.success) {
        throw new Error(response.message);
      }

      return { success: true };
    } catch (error: any) {
      // 4. Rollback on failure
      setState(snapshot);
      await impact('error');
      Alert.alert('Error', error.message || 'Operation failed');
      return { success: false, error };
    }
  };
}
