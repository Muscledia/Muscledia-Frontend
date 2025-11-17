import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, getThemeColors } from '@/constants/Colors';
import { ArrowLeft, AlertCircle } from 'lucide-react-native';
import { useHaptics } from '@/hooks/useHaptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoutineFolder, WorkoutPlan } from '@/types/api';
import { RoutineFolderService } from '@/services/routineFolderService';
import { WorkoutPlanService } from '@/services/workoutPlanService';
import { RoutineHeader } from '@/components/routines/RoutineHeader';
import { WorkoutPlanList } from '@/components/routines/WorkoutPlanList';
import { SaveRoutineButton } from '@/components/routines/SaveRoutineButton';

export default function RoutineDetailScreen() {
  // Always use dark mode
  const theme = getThemeColors(true);
  const { impact } = useHaptics();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [routineFolder, setRoutineFolder] = useState<RoutineFolder | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch routine folder and workout plans
  const fetchRoutineData = useCallback(
    async (isRefresh = false) => {
      if (!id) {
        setError('Invalid routine ID');
        setLoading(false);
        return;
      }

      try {
        if (!isRefresh) {
          setLoading(true);
        }
        setError(null);

        console.log('Fetching routine folder:', id);

        // Fetch routine folder details
        const folderResponse = await RoutineFolderService.getRoutineFolderById(id);

        if (!folderResponse.success || !folderResponse.data) {
          throw new Error('Failed to load routine folder');
        }

        setRoutineFolder(folderResponse.data);

        // Fetch workout plans
        console.log('Fetching workout plans for routine folder:', id);
        const plansResponse = await WorkoutPlanService.getWorkoutPlansByRoutineFolder(id);

        if (plansResponse.success && plansResponse.data) {
          setWorkoutPlans(plansResponse.data);
          console.log(`Loaded ${plansResponse.data.length} workout plans`);
        } else {
          // If no plans, just set empty array - not an error
          setWorkoutPlans([]);
          console.log('No workout plans found for this routine');
        }
      } catch (err: any) {
        console.error('Error fetching routine data:', err);
        setError(err.message || 'Failed to load routine details. Please try again.');
      } finally {
        setLoading(false);
        if (isRefresh) {
          setRefreshing(false);
        }
      }
    },
    [id]
  );

  // Initial load
  useEffect(() => {
    fetchRoutineData();
  }, [fetchRoutineData]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await impact('light');
    await fetchRoutineData(true);
  }, [fetchRoutineData, impact]);

  // Retry handler
  const handleRetry = async () => {
    await impact('medium');
    fetchRoutineData();
  };

  // Navigate back
  const handleBack = async () => {
    await impact('selection');
    router.back();
  };

  // Handle workout plan press
  const handleWorkoutPlanPress = async (workoutPlan: WorkoutPlan) => {
    await impact('selection');
    // TODO: Navigate to workout plan details screen
    // router.push(`/workout-plan/${workoutPlan.id}`);
    console.log('Navigate to workout plan:', workoutPlan.id);
  };

  // Handle save routine
  const handleSaveRoutine = async () => {
    await impact('medium');
    // TODO: Implement save logic when API is ready
    console.log('Saving routine to user collection:', id);
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: Math.max(16, insets.top + 8) }]}>
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Routine Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading routine details...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: Math.max(16, insets.top + 8) }]}>
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Routine Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <View style={[styles.errorIcon, { backgroundColor: Colors.status.error.light }]}>
            <AlertCircle size={48} color={Colors.status.error.main} />
          </View>
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            Oops! Something went wrong
          </Text>
          <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.accent }]}
            onPress={handleRetry}
            activeOpacity={0.9}
          >
            <Text style={[styles.retryButtonText, { color: theme.cardText }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // No data state
  if (!routineFolder) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: Math.max(16, insets.top + 8) }]}>
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Routine Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
            Routine not found
          </Text>
        </View>
      </View>
    );
  }

  // Main content with data
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top + 8) }]}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Routine Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      >
        {/* Routine Header */}
        <RoutineHeader routineFolder={routineFolder} />

        {/* Workout Plans List */}
        <View style={styles.workoutPlansSection}>
          <WorkoutPlanList
            workoutPlans={workoutPlans}
            onWorkoutPlanPress={handleWorkoutPlanPress}
          />
        </View>
      </ScrollView>

      {/* Save Button - Fixed at bottom */}
      <SaveRoutineButton routineFolderId={routineFolder.id} onSave={handleSaveRoutine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
  },
  workoutPlansSection: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  errorIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

