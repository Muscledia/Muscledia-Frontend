import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { RoutineService, WorkoutPlanService } from '@/services';
import { RoutineFolder, WorkoutPlan } from '@/types/api';
import { useHaptics } from '@/hooks/useHaptics';

// Components
import RoutineHeader from '@/components/routines/RoutineHeader';
import WorkoutPlanList from '@/components/routines/WorkoutPlanList';
import SaveRoutineButton from '@/components/routines/SaveRoutineButton';

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

  const [routine, setRoutine] = useState<RoutineFolder | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch routine details and workout plans
  const fetchRoutineData = async (isRefreshing = false) => {
    if (!id) return;

    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      // Fetch routine folder details and workout plans in parallel
      const [routineResponse, plansResponse] = await Promise.all([
        RoutineService.getRoutineFolderById(id),
        WorkoutPlanService.getWorkoutPlansByRoutineFolderId(id),
      ]);

      if (routineResponse.success && routineResponse.data) {
        setRoutine(routineResponse.data);
      } else {
        setError(routineResponse.message || 'Failed to load routine details');
      }

      if (plansResponse.success && plansResponse.data) {
        setWorkoutPlans(plansResponse.data);
      } else {
        // If routine loads but plans fail, still show routine with empty plans
        console.warn('Failed to load workout plans:', plansResponse.message);
        setWorkoutPlans([]);
      }
    } catch (err: any) {
      console.error('Error fetching routine data:', err);
      setError(err.message || 'An error occurred while loading the routine');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoutineData();
  }, [id]);

  // Pull to refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchRoutineData(true);
  };

  // Handle workout plan press
  const handlePlanPress = async (planId: string) => {
    await impact('selection');
    // TODO: Navigate to workout plan details screen
    console.log('Navigate to workout plan:', planId);
  };

  // Handle save routine
  const handleSaveRoutine = async (routineId: string) => {
    // TODO: Implement actual save to user's routines logic
    console.log('Save routine to user:', routineId);
    await impact('success');
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading routine...
        </Text>
      </View>
    );
  }

  // Error state
  if (error || !routine) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <AlertCircle size={64} color={theme.error} />
        <Text style={[styles.errorTitle, { color: theme.text }]}>
          Failed to Load Routine
        </Text>
        <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
          {error || 'Routine not found'}
        </Text>
        <TouchableOpacity
          onPress={async () => {
            await impact('medium');
            fetchRoutineData();
          }}
          style={styles.retryButton}
        >
          <LinearGradient
            colors={[theme.accent, theme.accentSecondary]}
            locations={[0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.retryButtonGradient}
          >
            <Text style={[styles.retryButtonText, { color: theme.cardText }]}>
              Try Again
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // Main content
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      >
        <RoutineHeader routine={routine} />
        
        <SaveRoutineButton
          routineId={routine.id}
          routineName={routine.name}
          onSave={handleSaveRoutine}
        />

        <View style={styles.divider} />

        <WorkoutPlanList
          workoutPlans={workoutPlans}
          onPlanPress={handlePlanPress}
          loading={loading}
        />

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  bottomPadding: {
    height: 24,
  },
});

