// app/workout-plan-detail/[planId].tsx - UPDATED with Delete Menu

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Share2,
  MoreVertical,
  Timer,
  Dumbbell,
} from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { WorkoutPlanService } from '@/services';
import { WorkoutPlan, PlannedExercise } from '@/types/api';
import { useHaptics } from '@/hooks/useHaptics';
import { useAuth } from '@/hooks/useAuth';

export default function WorkoutPlanDetailScreen() {
  const { planId, initialData } = useLocalSearchParams<{ planId: string; initialData?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();
  const { user } = useAuth();

  const [plan, setPlan] = useState<WorkoutPlan | null>(() => {
    if (initialData) {
      try {
        return JSON.parse(initialData as string);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(!plan);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!plan && planId) {
      loadWorkoutPlan();
    }
  }, [planId]);

  const loadWorkoutPlan = async () => {
    try {
      setLoading(true);
      const response = await WorkoutPlanService.getWorkoutPlanById(planId);

      if (response.success && response.data) {
        setPlan(response.data);
      }
    } catch (error) {
      console.error('Failed to load workout plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalSets = () => {
    if (!plan?.exercises) return 0;
    return plan.exercises.reduce((total, exercise) => total + (exercise.sets?.length || 0), 0);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const startWorkout = async () => {
    await impact('medium');
    router.push({
      pathname: `/workout-session/${planId}`,
      params: { initialData: JSON.stringify(plan) }
    });
  };

  // Handle menu options: Share, Edit, Duplicate, Delete
  const handleShowMenu = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Share', 'Edit Routine', 'Duplicate', 'Delete'],
        destructiveButtonIndex: 4,
        cancelButtonIndex: 0,
        title: 'Routine Options',
        message: plan?.title,
      },
      async (buttonIndex) => {
        await impact('light');

        switch (buttonIndex) {
          case 1:
            handleShare();
            break;
          case 2:
            handleEditRoutine();
            break;
          case 3:
            handleDuplicate();
            break;
          case 4:
            handleDelete();
            break;
          default:
            break;
        }
      }
    );
  };

  const handleShare = async () => {
    await impact('medium');
    Alert.alert('Share', 'Share functionality coming soon');
  };

  const handleEditRoutine = async () => {
    await impact('medium');
    router.push({
      pathname: '/workout-plans/[planId]/edit',
      params: { planId },
    });
  };

  const handleDuplicate = async () => {
    await impact('medium');

    Alert.prompt(
      'Duplicate Routine',
      `Copy "${plan?.title}" as:`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Duplicate',
          onPress: async (newTitle) => {
            if (!newTitle || !newTitle.trim()) {
              Alert.alert('Error', 'Please enter a name for the new routine');
              return;
            }

            try {
              const response = await WorkoutPlanService.duplicateWorkoutPlan(
                planId,
                newTitle.trim()
              );

              if (response.success && response.data) {
                await impact('success');
                Alert.alert('Success', 'Routine duplicated!', [
                  {
                    text: 'View New',
                    onPress: () => {
                      router.push({
                        pathname: '/workout-plan-detail/[planId]',
                        params: { planId: response.data.id },
                      });
                    },
                  },
                  {
                    text: 'OK',
                    onPress: () => loadWorkoutPlan(),
                  },
                ]);
              }
            } catch (error) {
              console.error('Failed to duplicate plan:', error);
              Alert.alert('Error', 'Failed to duplicate routine');
              await impact('error');
            }
          },
        },
      ],
      'plain-text',
      `${plan?.title} (Copy)`
    );
  };

  // DELETE HANDLER - Called when user selects Delete from menu
  const handleDelete = async () => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${plan?.title}"? This cannot be undone.`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              setDeleting(true);
              await impact('medium');

              const response = await WorkoutPlanService.deleteWorkoutPlan(planId);

              if (response.success) {
                await impact('success');
                Alert.alert('Success', 'Routine deleted', [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.back();
                    },
                  },
                ]);
              } else {
                await impact('error');
                Alert.alert('Error', response.message || 'Failed to delete routine');
              }
            } catch (error) {
              console.error('Failed to delete plan:', error);
              await impact('error');
              Alert.alert('Error', 'Failed to delete routine');
            } finally {
              setDeleting(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Workout plan not found</Text>
      </View>
    );
  }

  const totalSets = calculateTotalSets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          onPress={async () => { await impact('light'); router.back(); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Routine</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={async () => { await impact('light'); }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginRight: 16 }}
          >
            <Share2 size={22} color={theme.text} />
          </TouchableOpacity>
          {/* THREE DOTS MENU BUTTON - NOW WITH DELETE HANDLER */}
          <TouchableOpacity
            onPress={handleShowMenu}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={deleting}
          >
            <MoreVertical size={22} color={deleting ? theme.textMuted : theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.planTitle, { color: theme.text }]}>{plan.title}</Text>
          <Text style={[styles.createdBy, { color: theme.textMuted }]}>
            Created by {user?.username || user?.email?.split('@')[0] || 'Unknown'}
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {plan.estimatedDurationMinutes ? formatDuration(plan.estimatedDurationMinutes) : 'N/A'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Est Duration</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.surface }]} />

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {plan.exercises?.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Exercises</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.surface }]} />

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text }]}>{totalSets}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Sets</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.surface }]} />

          {/* Muscle Icons Placeholder */}
          <View style={styles.muscleIcons}>
            <Dumbbell size={24} color={theme.accent} />
            <Dumbbell size={24} color={theme.accent} />
          </View>
        </View>

        {/* Start Routine Button */}
        <TouchableOpacity
          onPress={startWorkout}
          activeOpacity={0.9}
          style={styles.startButton}
          disabled={deleting}
        >
          <LinearGradient
            colors={[theme.accent, theme.accentSecondary]}
            locations={[0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startGradient}
          >
            <Text style={[styles.startButtonText, { color: theme.cardText }]}>
              Start Routine
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Exercises Section Header */}
        <View style={styles.exercisesHeader}>
          <Text style={[styles.exercisesTitle, { color: theme.text }]}>Exercises</Text>
          <TouchableOpacity
            onPress={async () => { await impact('light'); }}
          >
            <Text style={[styles.editButton, { color: theme.accent }]}>Edit Routine</Text>
          </TouchableOpacity>
        </View>

        {/* Exercises List */}
        {plan.exercises?.map((exercise, index) => (
          <ExerciseCard
            key={index}
            exercise={exercise}
            index={index}
            theme={theme}
            impact={impact}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// Exercise Card Component
interface ExerciseCardProps {
  exercise: PlannedExercise;
  index: number;
  theme: any;
  impact: any;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, index, theme, impact }) => {
  const getSetDisplay = (set: any, idx: number) => {
    if (set.type === 'warmup') {
      return { label: 'W', value: 'Warmup' };
    }

    if (set.repRangeStart && set.repRangeEnd) {
      return { label: (idx + 1).toString(), value: `${set.repRangeStart}-${set.repRangeEnd}` };
    }

    if (set.reps) {
      return { label: (idx + 1).toString(), value: set.reps.toString() };
    }

    if (set.durationSeconds) {
      const mins = Math.floor(set.durationSeconds / 60);
      const secs = set.durationSeconds % 60;
      return {
        label: (idx + 1).toString(),
        value: mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
      };
    }

    return { label: (idx + 1).toString(), value: '-' };
  };

  return (
    <View style={[styles.exerciseCard, { backgroundColor: theme.surface }]}>
      {/* Exercise Header */}
      <View style={styles.exerciseCardHeader}>
        <View style={[styles.exerciseIcon, { backgroundColor: theme.accent + '20' }]}>
          <Dumbbell size={20} color={theme.accent} />
        </View>
        <Text style={[styles.exerciseTitle, { color: theme.accent }]}>
          {exercise.title || exercise.name}
        </Text>
      </View>

      {/* Rest Timer */}
      {exercise.restSeconds > 0 && (
        <View style={styles.restTimer}>
          <Timer size={16} color={theme.accent} />
          <Text style={[styles.restTimerText, { color: theme.accent }]}>
            Rest Timer: {Math.floor(exercise.restSeconds / 60)}min {exercise.restSeconds % 60}s
          </Text>
        </View>
      )}

      {/* Exercise Notes */}
      {exercise.notes && (
        <Text style={[styles.exerciseNotes, { color: theme.textSecondary }]}>
          {exercise.notes}
        </Text>
      )}

      {/* Sets Table */}
      <View style={styles.setsTable}>
        {/* Table Header */}
        <View style={[styles.tableHeader, { borderBottomColor: theme.background }]}>
          <Text style={[styles.tableHeaderText, { color: theme.textMuted }]}>SET</Text>
          <Text style={[styles.tableHeaderText, { color: theme.textMuted }]}>KG</Text>
          <Text style={[styles.tableHeaderText, { color: theme.textMuted }]}>REP RANGE</Text>
        </View>

        {/* Sets Rows */}
        {exercise.sets?.map((set, idx) => {
          const setDisplay = getSetDisplay(set, idx);
          const isWarmup = set.type === 'warmup';

          return (
            <View
              key={idx}
              style={[
                styles.setRow,
                { backgroundColor: isWarmup ? theme.accent + '10' : 'transparent' }
              ]}
            >
              <Text style={[styles.setNumber, { color: isWarmup ? theme.accent : theme.text }]}>
                {setDisplay.label}
              </Text>
              <Text style={[styles.setWeight, { color: theme.text }]}>
                {set.weightKg || '-'}
              </Text>
              <Text style={[styles.setReps, { color: theme.text }]}>
                {setDisplay.value}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  planTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  createdBy: {
    fontSize: 14,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  muscleIcons: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 16,
  },
  startButton: {
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  startGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  exercisesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    fontSize: 15,
    fontWeight: '600',
  },
  exerciseCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  restTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  restTimerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  exerciseNotes: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  setsTable: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  setNumber: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  setWeight: {
    flex: 1,
    fontSize: 15,
    textAlign: 'center',
  },
  setReps: {
    flex: 1,
    fontSize: 15,
    textAlign: 'center',
  },
});
