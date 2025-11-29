// app/routine-detail/[planId].tsx

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
import { RoutineService } from '@/services';
import { RoutineFolder } from '@/types/api';
import { useHaptics } from '@/hooks/useHaptics';

// Components
import RoutineHeader from '@/components/routines/RoutineHeader';
import WorkoutPlanCard from '@/components/routines/WorkoutPlanCard';
import SaveRoutineButton from '@/components/routines/SaveRoutineButton';

export default function RoutineDetailScreen() {
  const { id, isPublic } = useLocalSearchParams<{ id: string; isPublic?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

  const [routine, setRoutine] = useState<RoutineFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if this is a public or personal routine
  const isPublicRoutine = isPublic === 'true' || isPublic === undefined;

  // Fetch routine with embedded workout plans
  const fetchRoutineData = async (isRefreshing = false) => {
    if (!id) return;

    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      // Single API call gets everything (routine + workout plans + exercises)!
      const routineResponse = isPublicRoutine
        ? await RoutineService.getPublicRoutineFolderById(id)
        : await RoutineService.getPersonalRoutineFolderById(id);

      if (routineResponse.success && routineResponse.data) {
        setRoutine(routineResponse.data);
        console.log('Loaded routine with', routineResponse.data.workoutPlans?.length || 0, 'workout plans');
      } else {
        setError(routineResponse.message || 'Failed to load routine details');
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
    const selectedPlan = routine?.workoutPlans.find(p => p.id === planId);

    if (selectedPlan) {
      router.push({
        pathname: `/workout-plan-detail/${planId}`,
        params: { initialData: JSON.stringify(selectedPlan) }
      });
    } else {
      router.push(`/workout-plan-detail/${planId}`);
    }
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
        {/* Routine Header */}
        <RoutineHeader routine={routine} />

        {/* Save Button (only for public routines) */}
        {isPublicRoutine && (
          <SaveRoutineButton
            routineId={routine.id}
            routineName={routine.title}
          />
        )}

        <View style={styles.divider} />

        {/* Workout Plans Section */}
        <View style={styles.plansSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Workout Plans ({routine.workoutPlans?.length || 0})
          </Text>

          {routine.workoutPlans && routine.workoutPlans.length > 0 ? (
            routine.workoutPlans.map((plan, index) => (
              <WorkoutPlanCard
                key={plan.id}
                plan={plan}
                index={index}
                onPress={() => handlePlanPress(plan.id)}
              />
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No workout plans in this routine yet
              </Text>
            </View>
          )}
        </View>

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
    marginVertical: 16,
  },
  plansSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 24,
  },
});
