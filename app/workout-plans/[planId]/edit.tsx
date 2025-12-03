// app/workout-plans/[planId]/edit.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Dumbbell,
  GripVertical,
} from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import {
  WorkoutPlanService,
  WorkoutPlan,
  PlannedExercise,
  PlannedSet,
} from '@/services';
import { useHaptics } from '@/hooks/useHaptics';

export default function EditWorkoutPlanScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkoutPlan();
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
      Alert.alert('Error', 'Failed to load workout plan');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = async () => {
    await impact('medium');
    router.push({
      pathname: '/workout-plans/[planId]/add-exercise',
      params: { planId },
    });
  };

  const handleDeleteExercise = async (exerciseIndex: number) => {
    await impact('medium');

    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to remove this exercise from the plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await WorkoutPlanService.deleteExerciseFromWorkoutPlan(
                planId,
                exerciseIndex
              );

              if (response.success && response.data) {
                setPlan(response.data);
                await impact('success');
              }
            } catch (error) {
              console.error('Failed to delete exercise:', error);
              Alert.alert('Error', 'Failed to delete exercise');
              await impact('error');
            }
          },
        },
      ]
    );
  };

  const handleAddSet = async (exerciseIndex: number) => {
    if (!plan) return;

    await impact('light');

    const exercise = plan.exercises[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];

    const newSet: PlannedSet = {
      setNumber: exercise.sets.length + 1,
      reps: lastSet?.reps || 10,
      weightKg: lastSet?.weightKg || undefined,
      type: 'NORMAL',
    };

    const updatedSets = [...exercise.sets, newSet];

    try {
      const response = await WorkoutPlanService.updateExerciseInWorkoutPlan(
        planId,
        exerciseIndex,
        { sets: updatedSets }
      );

      if (response.success && response.data) {
        setPlan(response.data);
      }
    } catch (error) {
      console.error('Failed to add set:', error);
      Alert.alert('Error', 'Failed to add set');
    }
  };

  const handleDeleteSet = async (exerciseIndex: number, setIndex: number) => {
    if (!plan) return;

    await impact('medium');

    const exercise = plan.exercises[exerciseIndex];
    const updatedSets = exercise.sets.filter((_, idx) => idx !== setIndex);

    // Renumber sets
    updatedSets.forEach((set, idx) => {
      set.setNumber = idx + 1;
    });

    try {
      const response = await WorkoutPlanService.updateExerciseInWorkoutPlan(
        planId,
        exerciseIndex,
        { sets: updatedSets }
      );

      if (response.success && response.data) {
        setPlan(response.data);
        await impact('success');
      }
    } catch (error) {
      console.error('Failed to delete set:', error);
      Alert.alert('Error', 'Failed to delete set');
      await impact('error');
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!plan) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: theme.background },
        ]}
      >
        <Text style={{ color: theme.text }}>Workout plan not found</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            onPress={async () => {
              await impact('light');
              router.back();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Plan</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Plan Title */}
          <View style={styles.titleSection}>
            <Text style={[styles.planTitle, { color: theme.text }]}>{plan.title}</Text>
            {plan.description && (
              <Text style={[styles.planDescription, { color: theme.textMuted }]}>
                {plan.description}
              </Text>
            )}
          </View>

          {/* Exercises */}
          <View style={styles.exercisesSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Exercises ({plan.exercises.length})
              </Text>
              <TouchableOpacity onPress={handleAddExercise} activeOpacity={0.7}>
                <Text style={[styles.addButton, { color: theme.accent }]}>
                  Add Exercise
                </Text>
              </TouchableOpacity>
            </View>

            {plan.exercises.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
                <Dumbbell size={48} color={theme.textMuted} />
                <Text style={[styles.emptyStateText, { color: theme.textMuted }]}>
                  No exercises yet
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: theme.textMuted }]}>
                  Tap "Add Exercise" to get started
                </Text>
              </View>
            ) : (
              plan.exercises.map((exercise, exerciseIndex) => (
                <ExerciseCard
                  key={exerciseIndex}
                  exercise={exercise}
                  exerciseIndex={exerciseIndex}
                  theme={theme}
                  onDelete={handleDeleteExercise}
                  onAddSet={handleAddSet}
                  onDeleteSet={handleDeleteSet}
                  impact={impact}
                />
              ))
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Add Exercise Button */}
        {plan.exercises.length > 0 && (
          <View style={[styles.footer, { backgroundColor: theme.background }]}>
            <TouchableOpacity
              style={[styles.addExerciseButton, { backgroundColor: theme.accent }]}
              onPress={handleAddExercise}
              activeOpacity={0.8}
            >
              <Plus size={20} color={theme.cardText} />
              <Text style={[styles.addExerciseButtonText, { color: theme.cardText }]}>
                Add Exercise
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

// Exercise Card Component with Swipeable Sets
interface ExerciseCardProps {
  exercise: PlannedExercise;
  exerciseIndex: number;
  theme: any;
  onDelete: (exerciseIndex: number) => void;
  onAddSet: (exerciseIndex: number) => void;
  onDeleteSet: (exerciseIndex: number, setIndex: number) => void;
  impact: any;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
                                                     exercise,
                                                     exerciseIndex,
                                                     theme,
                                                     onDelete,
                                                     onAddSet,
                                                     onDeleteSet,
                                                     impact,
                                                   }) => {
  const renderRightActions = () => (
    <TouchableOpacity
      style={[styles.deleteAction, { backgroundColor: '#FF3B30' }]}
      onPress={async () => {
        await impact('medium');
        onDelete(exerciseIndex);
      }}
      activeOpacity={0.8}
    >
      <Trash2 size={20} color="#FFFFFF" />
      <Text style={styles.deleteActionText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderSetRightActions = (setIndex: number) => (
    <TouchableOpacity
      style={[styles.deleteAction, { backgroundColor: '#FF3B30' }]}
      onPress={async () => {
        await impact('medium');
        onDeleteSet(exerciseIndex, setIndex);
      }}
      activeOpacity={0.8}
    >
      <Trash2 size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <View style={[styles.exerciseCard, { backgroundColor: theme.surface }]}>
        {/* Exercise Header */}
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseInfo}>
            <View style={[styles.exerciseIcon, { backgroundColor: theme.accent + '20' }]}>
              <Dumbbell size={20} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.exerciseTitle, { color: theme.text }]}>
                {exercise.title}
              </Text>
              {exercise.notes && (
                <Text style={[styles.exerciseNotes, { color: theme.textMuted }]}>
                  {exercise.notes}
                </Text>
              )}
            </View>
          </View>
          <GripVertical size={20} color={theme.textMuted} />
        </View>

        {/* Sets */}
        <View style={styles.setsContainer}>
          {exercise.sets.map((set, setIndex) => (
            <Swipeable
              key={setIndex}
              renderRightActions={() => renderSetRightActions(setIndex)}
              overshootRight={false}
            >
              <View
                style={[
                  styles.setRow,
                  { backgroundColor: theme.background, borderColor: theme.surface },
                ]}
              >
                <Text style={[styles.setNumber, { color: theme.textMuted }]}>
                  {set.setNumber}
                </Text>
                <Text style={[styles.setText, { color: theme.text }]}>
                  {set.repRangeStart && set.repRangeEnd
                    ? `${set.repRangeStart}-${set.repRangeEnd} reps`
                    : `${set.reps} reps`}
                  {set.weightKg ? ` × ${set.weightKg}kg` : ''}
                  {set.durationSeconds ? ` ${Math.floor(set.durationSeconds / 60)}min` : ''}
                </Text>
              </View>
            </Swipeable>
          ))}

          {/* Add Set Button */}
          <TouchableOpacity
            style={styles.addSetButton}
            onPress={async () => {
              await impact('light');
              onAddSet(exerciseIndex);
            }}
            activeOpacity={0.7}
          >
            <Plus size={16} color={theme.accent} />
            <Text style={[styles.addSetText, { color: theme.accent }]}>Add Set</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
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
  planDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  exercisesSection: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  exerciseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseNotes: {
    fontSize: 13,
    marginTop: 4,
  },
  setsContainer: {
    gap: 4,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    width: 24,
  },
  setText: {
    fontSize: 14,
    flex: 1,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginLeft: 8,
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addExerciseButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
