// app/workout-session/[planId].tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Clock,
  Check,
  Plus,
  Minus,
  MoreVertical,
  ChevronDown,
  Timer,
} from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { WorkoutPlanService } from '@/services';
import { WorkoutPlan, PlannedExercise, PlannedSet } from '@/types/api';
import { useHaptics } from '@/hooks/useHaptics';

interface SetLog {
  index: number;
  type: 'warmup' | 'normal' | 'failure' | 'drop';
  weightKg: number | null;
  reps: number | null;
  completed: boolean;
}

interface ExerciseLog {
  exerciseTemplateId: string;
  title: string;
  notes?: string;
  sets: SetLog[];
  restSeconds: number;
}

export default function WorkoutSessionScreen() {
  const { planId, initialData } = useLocalSearchParams<{ planId: string; initialData?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

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
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [workoutStartTime] = useState(new Date());

  useEffect(() => {
    if (plan && exerciseLogs.length === 0) {
      initializeExerciseLogs();
    }
  }, [plan]);

  const initializeExerciseLogs = () => {
    if (!plan?.exercises) return;

    const logs: ExerciseLog[] = plan.exercises.map(exercise => ({
      exerciseTemplateId: exercise.exerciseTemplateId,
      title: exercise.title,
      notes: exercise.notes,
      restSeconds: exercise.restSeconds || 60,
      sets: exercise.sets?.map((set, idx) => ({
        index: idx,
        type: set.type || 'normal',
        weightKg: set.weightKg || null,
        reps: set.reps || null,
        completed: false,
      })) || [],
    }));

    setExerciseLogs(logs);
  };

  const currentExercise = exerciseLogs[currentExerciseIndex];

  // Update set value
  const updateSet = (setIndex: number, field: 'weightKg' | 'reps', value: number | null) => {
    setExerciseLogs(prev => {
      const updated = [...prev];
      updated[currentExerciseIndex].sets[setIndex] = {
        ...updated[currentExerciseIndex].sets[setIndex],
        [field]: value,
      };
      return updated;
    });
  };

  // Toggle set completion
  const toggleSetComplete = async (setIndex: number) => {
    await impact('light');

    setExerciseLogs(prev => {
      const updated = [...prev];
      const currentSet = updated[currentExerciseIndex].sets[setIndex];
      currentSet.completed = !currentSet.completed;

      // Start rest timer if completing a set
      if (currentSet.completed && currentExercise.restSeconds > 0) {
        setRestTimeRemaining(currentExercise.restSeconds);
        setShowRestTimer(true);
      }

      return updated;
    });
  };

  // Add new set
  const addSet = async () => {
    await impact('medium');

    setExerciseLogs(prev => {
      const updated = [...prev];
      const lastSet = updated[currentExerciseIndex].sets[updated[currentExerciseIndex].sets.length - 1];

      updated[currentExerciseIndex].sets.push({
        index: updated[currentExerciseIndex].sets.length,
        type: 'normal',
        weightKg: lastSet?.weightKg || null,
        reps: lastSet?.reps || null,
        completed: false,
      });

      return updated;
    });
  };

  // Remove last set
  const removeSet = async () => {
    await impact('warning');

    if (currentExercise.sets.length <= 1) return;

    setExerciseLogs(prev => {
      const updated = [...prev];
      updated[currentExerciseIndex].sets.pop();
      return updated;
    });
  };

  // Navigate exercises
  const goToNextExercise = async () => {
    await impact('medium');
    if (currentExerciseIndex < exerciseLogs.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const goToPreviousExercise = async () => {
    await impact('medium');
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  // Finish workout
  const finishWorkout = async () => {
    await impact('success');

    Alert.alert(
      'Finish Workout',
      'Great job! Ready to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: () => {
            // TODO: Save workout to backend
            console.log('Workout completed:', exerciseLogs);
            router.back();
          },
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

  if (!currentExercise) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>No exercises found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{plan?.title}</Text>
        <TouchableOpacity onPress={finishWorkout} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Check size={24} color={theme.accent} />
        </TouchableOpacity>
      </View>

      {/* Exercise Progress */}
      <View style={[styles.progressBar, { backgroundColor: theme.surface }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.accent,
              width: `${((currentExerciseIndex + 1) / exerciseLogs.length) * 100}%`
            }
          ]}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise Header */}
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseTitle}>
            <Text style={[styles.exerciseNumber, { color: theme.textMuted }]}>
              Exercise {currentExerciseIndex + 1}/{exerciseLogs.length}
            </Text>
            <Text style={[styles.exerciseName, { color: theme.text }]}>
              {currentExercise.title}
            </Text>
          </View>

          {currentExercise.notes && (
            <Text style={[styles.exerciseNotes, { color: theme.textSecondary }]}>
              {currentExercise.notes}
            </Text>
          )}

          {/* Rest Timer Display */}
          {currentExercise.restSeconds > 0 && (
            <TouchableOpacity
              style={[styles.restTimerBadge, { backgroundColor: theme.accent + '20' }]}
              onPress={async () => {
                await impact('light');
                setShowRestTimer(true);
                setRestTimeRemaining(currentExercise.restSeconds);
              }}
            >
              <Timer size={16} color={theme.accent} />
              <Text style={[styles.restTimerText, { color: theme.accent }]}>
                Rest: {currentExercise.restSeconds}s
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Set Table Header */}
        <View style={[styles.tableHeader, { borderBottomColor: theme.surface }]}>
          <Text style={[styles.headerCell, styles.setColumn, { color: theme.textMuted }]}>SET</Text>
          <Text style={[styles.headerCell, styles.kgColumn, { color: theme.textMuted }]}>KG</Text>
          <Text style={[styles.headerCell, styles.repsColumn, { color: theme.textMuted }]}>REPS</Text>
          <View style={styles.checkColumn} />
        </View>

        {/* Sets */}
        {currentExercise.sets.map((set, index) => (
          <View
            key={index}
            style={[
              styles.setRow,
              set.completed && styles.setRowCompleted,
              { backgroundColor: set.completed ? theme.accent + '10' : 'transparent' }
            ]}
          >
            {/* Set Number */}
            <View style={styles.setColumn}>
              {set.type === 'warmup' ? (
                <Text style={[styles.setLabel, { color: theme.textMuted }]}>W</Text>
              ) : (
                <Text style={[styles.setLabel, { color: theme.text }]}>{index + 1}</Text>
              )}
            </View>

            {/* Weight Input */}
            <View style={styles.kgColumn}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.surface,
                    borderColor: set.completed ? theme.accent : theme.surface,
                  }
                ]}
                value={set.weightKg?.toString() || ''}
                onChangeText={(text) => updateSet(index, 'weightKg', text ? parseFloat(text) : null)}
                keyboardType="decimal-pad"
                placeholder="-"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            {/* Reps Input */}
            <View style={styles.repsColumn}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.surface,
                    borderColor: set.completed ? theme.accent : theme.surface,
                  }
                ]}
                value={set.reps?.toString() || ''}
                onChangeText={(text) => updateSet(index, 'reps', text ? parseInt(text) : null)}
                keyboardType="number-pad"
                placeholder="-"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            {/* Completion Checkbox */}
            <TouchableOpacity
              style={styles.checkColumn}
              onPress={() => toggleSetComplete(index)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: set.completed ? theme.accent : 'transparent',
                    borderColor: set.completed ? theme.accent : theme.textMuted,
                  }
                ]}
              >
                {set.completed && <Check size={16} color={theme.cardText} />}
              </View>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add/Remove Set Buttons */}
        <View style={styles.setActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
            onPress={addSet}
            activeOpacity={0.7}
          >
            <Plus size={18} color={theme.accent} />
            <Text style={[styles.actionButtonText, { color: theme.accent }]}>Add Set</Text>
          </TouchableOpacity>

          {currentExercise.sets.length > 1 && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.surface }]}
              onPress={removeSet}
              activeOpacity={0.7}
            >
              <Minus size={18} color={theme.error} />
              <Text style={[styles.actionButtonText, { color: theme.error }]}>Remove Set</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigation}>
          {currentExerciseIndex > 0 && (
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: theme.surface }]}
              onPress={goToPreviousExercise}
              activeOpacity={0.9}
            >
              <Text style={[styles.navButtonText, { color: theme.text }]}>Previous Exercise</Text>
            </TouchableOpacity>
          )}

          {currentExerciseIndex < exerciseLogs.length - 1 ? (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonPrimary]}
              onPress={goToNextExercise}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.accent, theme.accentSecondary]}
                locations={[0.55, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.navButtonGradient}
              >
                <Text style={[styles.navButtonText, { color: theme.cardText }]}>Next Exercise</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonPrimary]}
              onPress={finishWorkout}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.accent, theme.accentSecondary]}
                locations={[0.55, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.navButtonGradient}
              >
                <Text style={[styles.navButtonText, { color: theme.cardText }]}>Finish Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Rest Timer Modal */}
      <Modal
        visible={showRestTimer}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRestTimer(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.timerModal, { backgroundColor: theme.background }]}>
            <Text style={[styles.timerTitle, { color: theme.text }]}>Rest Timer</Text>
            <Text style={[styles.timerDisplay, { color: theme.accent }]}>
              {Math.floor(restTimeRemaining / 60)}:{(restTimeRemaining % 60).toString().padStart(2, '0')}
            </Text>
            <TouchableOpacity
              style={[styles.timerButton, { backgroundColor: theme.accent }]}
              onPress={async () => {
                await impact('light');
                setShowRestTimer(false);
              }}
            >
              <Text style={[styles.timerButtonText, { color: theme.cardText }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  exerciseHeader: {
    marginBottom: 24,
  },
  exerciseTitle: {
    marginBottom: 8,
  },
  exerciseNumber: {
    fontSize: 13,
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  exerciseNotes: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  restTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  restTimerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  setRowCompleted: {
    opacity: 0.7,
  },
  setColumn: {
    width: 50,
    alignItems: 'center',
  },
  kgColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },
  repsColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },
  checkColumn: {
    width: 50,
    alignItems: 'center',
  },
  setLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 40,
  },
  navButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  navButtonPrimary: {},
  navButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerModal: {
    width: '80%',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  timerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  timerButton: {
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
  },
  timerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
