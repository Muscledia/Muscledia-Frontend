// app/workout-session/[planId].tsx - FIXED TIMER LOGIC (Count Up & Stop on Complete)

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import {
  X,
  Check,
  Plus,
  ChevronDown,
  Timer,
  Dumbbell,
  MoreVertical,
  Play,
  Pause,
  Settings,
  Award,
  Trophy,
  Flame,
  TrendingUp,
  Star,
} from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { WorkoutService, WorkoutSession, WorkoutExercise, WorkoutSet, SetType } from '@/services/WorkoutService';
import { useHaptics } from '@/hooks/useHaptics';
import WorkoutAnalytics from '@/components/WorkoutAnalytics';
import { useQueryClient } from '@tanstack/react-query';

interface LocalSetData {
  weightKg: string;
  reps: string;
}

export default function WorkoutSessionScreen() {
  const { planId, isExistingSession } = useLocalSearchParams<{ planId: string; isExistingSession?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();
  const queryClient = useQueryClient();

  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSet, setSavingSet] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState('0s');
  const [workoutDurationSeconds, setWorkoutDurationSeconds] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [completedWorkout, setCompletedWorkout] = useState<WorkoutSession | null>(null);
  const [showShortWorkoutModal, setShowShortWorkoutModal] = useState(false);

  const [localSetValues, setLocalSetValues] = useState<Record<string, LocalSetData>>({});
  const [localSetTypes, setLocalSetTypes] = useState<Record<string, string>>({});

  // Rest timer states
  const [restTimerPreferences, setRestTimerPreferences] = useState<Record<number, number>>({});
  const [activeRestTimer, setActiveRestTimer] = useState<number | null>(null);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [showRestSettings, setShowRestSettings] = useState<number | null>(null);

  // Warmup/Duration timer states
  const [warmupTimers, setWarmupTimers] = useState<Record<string, number>>({});
  const [activeWarmupTimer, setActiveWarmupTimer] = useState<string | null>(null);

  const [localStartTime] = useState(new Date());
  const initialLoadComplete = useRef(false);

  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const warmupTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Start
  useEffect(() => {
    startWorkout();

    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (restTimerIntervalRef.current) clearInterval(restTimerIntervalRef.current);
      if (warmupTimerIntervalRef.current) clearInterval(warmupTimerIntervalRef.current);
    };
  }, [planId]);

  // Refresh when returning to screen
  useFocusEffect(
    useCallback(() => {
      if (workout?.id && initialLoadComplete.current) {
        refreshWorkoutSession(workout.id);
      }
    }, [workout?.id])
  );

  // Workout duration timer
  useEffect(() => {
    if (workout) {
      durationIntervalRef.current = setInterval(() => {
        const now = new Date();
        const durationMs = now.getTime() - localStartTime.getTime();

        const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
        setWorkoutDurationSeconds(totalSeconds);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
          setWorkoutDuration(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setWorkoutDuration(`${minutes}m ${seconds}s`);
        } else {
          setWorkoutDuration(`${seconds}s`);
        }
      }, 1000);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [workout, localStartTime]);

  // Rest timer countdown
  useEffect(() => {
    if (activeRestTimer !== null && restTimeRemaining > 0) {
      restTimerIntervalRef.current = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            if (restTimerIntervalRef.current) {
              clearInterval(restTimerIntervalRef.current);
            }
            impact('heavy');
            setActiveRestTimer(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current);
      }
    };
  }, [activeRestTimer, restTimeRemaining]);

  // Warmup timer - Count Up
  useEffect(() => {
    if (activeWarmupTimer) {
      warmupTimerIntervalRef.current = setInterval(() => {
        setWarmupTimers(prev => {
          const currentTime = prev[activeWarmupTimer] || 0;
          return { ...prev, [activeWarmupTimer]: currentTime + 1 };
        });
      }, 1000);
    }

    return () => {
      if (warmupTimerIntervalRef.current) {
        clearInterval(warmupTimerIntervalRef.current);
      }
    };
  }, [activeWarmupTimer]);

  const startWorkout = async () => {
    try {
      setLoading(true);

      let response;
      if (isExistingSession === 'true') {
        // Load existing session (planId is actually the session ID here)
        response = await WorkoutService.getWorkoutSession(planId);
      } else {
        // Start new session from plan
        response = await WorkoutService.startWorkoutFromPlan(planId);
      }

      if (response.success && response.data) {
        setWorkout(response.data);
        initializeLocalValues(response.data);
        initializeRestTimers(response.data);
        initializeWarmupTimers(response.data);
        initialLoadComplete.current = true;
      } else {
        Alert.alert('Error', response.message || 'Failed to start workout');
        router.back();
      }
    } catch (error: any) {
      console.error('Error starting workout:', error);
      Alert.alert('Error', 'Failed to start workout session');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // FIX: Updated to accept reset flag
  const refreshWorkoutSession = async (workoutId: string, reset: boolean = false) => {
    try {
      console.log('Refreshing workout session:', workoutId);
      const response = await WorkoutService.getWorkoutSession(workoutId);
      if (response.success && response.data) {
        setWorkout(response.data);
        if (reset) {
          // Full re-initialization for structural changes (e.g. deletion)
          initializeLocalValues(response.data);
          initializeRestTimers(response.data);
          initializeWarmupTimers(response.data);
        } else {
          // Smart merge for updates (preserving input)
          refreshLocalValues(response.data);
        }
      }
    } catch (error) {
      console.error("Failed to refresh session", error);
    }
  };

  const initializeLocalValues = (workoutData: WorkoutSession) => {
    const initialValues: Record<string, LocalSetData> = {};
    const initialTypes: Record<string, string> = {};

    workoutData.exercises.forEach((exercise, exIdx) => {
      exercise.sets.forEach((set, setIdx) => {
        const key = `${exIdx}-${setIdx}`;
        initialValues[key] = {
          weightKg: set.weightKg?.toString() || '',
          reps: set.reps?.toString() || '',
        };
        initialTypes[key] = set.setType || 'NORMAL';
      });
    });

    setLocalSetValues(initialValues);
    setLocalSetTypes(initialTypes);
  };

  const refreshLocalValues = (workoutData: WorkoutSession) => {
    setLocalSetValues(prev => {
      const next = { ...prev };
      workoutData.exercises.forEach((exercise, exIdx) => {
        exercise.sets.forEach((set, setIdx) => {
          const key = `${exIdx}-${setIdx}`;
          if (!next[key] || set.completed) {
            next[key] = {
              weightKg: set.weightKg?.toString() || '',
              reps: set.reps?.toString() || '',
            };
          }
        });
      });
      return next;
    });

    setLocalSetTypes(prev => {
      const next = { ...prev };
      workoutData.exercises.forEach((exercise, exIdx) => {
        exercise.sets.forEach((set, setIdx) => {
          const key = `${exIdx}-${setIdx}`;
          if (!next[key] || set.setType) {
            next[key] = set.setType || 'NORMAL';
          }
        });
      });
      return next;
    });
  };

  const initializeRestTimers = (workoutData: WorkoutSession) => {
    const initialTimers: Record<number, number> = {};
    workoutData.exercises.forEach((exercise, index) => {
      initialTimers[index] = 120; // Default 2 minutes
    });
    setRestTimerPreferences(initialTimers);
  };

  const initializeWarmupTimers = (workoutData: WorkoutSession) => {
    const initialTimers: Record<string, number> = {};
    workoutData.exercises.forEach((exercise, exIdx) => {
      exercise.sets.forEach((set, setIdx) => {
        // If it's a duration exercise, we initialize local timer to 0 (unless we want to persist progress)
        if (set.durationSeconds !== null && set.durationSeconds !== undefined) {
          const key = `${exIdx}-${setIdx}`;
          // Start at 0 for stopwatch feeling
          initialTimers[key] = 0;
        }
      });
    });
    setWarmupTimers(initialTimers);
  };

  const getLocalSetKey = (exerciseIndex: number, setIndex: number) => {
    return `${exerciseIndex}-${setIndex}`;
  };

  const updateLocalValue = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weightKg' | 'reps',
    value: string
  ) => {
    const key = getLocalSetKey(exerciseIndex, setIndex);
    setLocalSetValues(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      }
    }));
  };

  const getPreviousSetData = (exerciseIndex: number, setIndex: number) => {
    if (!workout) return null;

    if (setIndex > 0) {
      const prevSet = workout.exercises[exerciseIndex].sets[setIndex - 1];
      return prevSet;
    }

    return null;
  };

  const toggleSetType = async (exerciseIndex: number, setIndex: number) => {
    if (!workout) return;

    await impact('light');

    const key = getLocalSetKey(exerciseIndex, setIndex);
    const currentType = localSetTypes[key] || 'NORMAL';

    let nextType: string;
    switch (currentType) {
      case 'NORMAL': nextType = 'WARMUP'; break;
      case 'WARMUP': nextType = 'DROP'; break;
      case 'DROP': nextType = 'FAILURE'; break;
      case 'FAILURE': nextType = 'NORMAL'; break;
      default: nextType = 'NORMAL';
    }

    console.log(`Set type toggle: ${currentType} → ${nextType}`);

    setLocalSetTypes(prev => ({
      ...prev,
      [key]: nextType
    }));

    try {
      WorkoutService.updateSetType(workout.id, exerciseIndex, setIndex, nextType);
    } catch (e) { console.error(e); }
  };

  const toggleSetComplete = async (exerciseIndex: number, setIndex: number) => {
    if (!workout) return;

    await impact('medium');

    const key = getLocalSetKey(exerciseIndex, setIndex);

    if (activeWarmupTimer === key) {
      setActiveWarmupTimer(null);
    }

    setSavingSet(true);

    const currentSet = workout.exercises[exerciseIndex].sets[setIndex];
    const localValues = localSetValues[key];
    const localSetType = localSetTypes[key] || 'NORMAL';

    // If warmupTimers has an entry (even 0), we treat it as duration exercise
    const currentDuration = warmupTimers[key];
    const isDurationExercise = currentDuration !== undefined;

    if (!currentSet.completed && !isDurationExercise) {
      const weightKg = localValues.weightKg ? parseFloat(localValues.weightKg) : null;
      const reps = localValues.reps ? parseInt(localValues.reps) : null;

      if (!weightKg || !reps) {
        Alert.alert('Missing Data', 'Please enter both weight and reps before completing the set');
        setSavingSet(false);
        return;
      }
    }

    try {
      const weightKg = localValues.weightKg ? parseFloat(localValues.weightKg) : null;
      const reps = localValues.reps ? parseInt(localValues.reps) : null;

      const response = await WorkoutService.updateSet(
        workout.id,
        exerciseIndex,
        setIndex,
        {
          completed: !currentSet.completed,
          weightKg: isDurationExercise ? null : weightKg,
          reps: isDurationExercise ? null : reps,
          durationSeconds: isDurationExercise ? currentDuration : null,
          setType: localSetType,
        }
      );

      if (response.success && response.data) {
        setWorkout(response.data);

        const updatedSet = response.data.exercises[exerciseIndex].sets[setIndex];
        setLocalSetValues(prev => ({
          ...prev,
          [key]: {
            weightKg: updatedSet.weightKg?.toString() || '',
            reps: updatedSet.reps?.toString() || '',
          }
        }));

        setLocalSetTypes(prev => ({
          ...prev,
          [key]: updatedSet.setType || 'NORMAL'
        }));

        if (!currentSet.completed && !isDurationExercise) {
          const restTime = restTimerPreferences[exerciseIndex] || 120;
          setRestTimeRemaining(restTime);
          setActiveRestTimer(exerciseIndex);
        }

        await impact('success');
      }
    } catch (error) {
      console.error('Failed to update set:', error);
      Alert.alert('Error', 'Failed to update set');
      await impact('error');
    } finally {
      setSavingSet(false);
    }
  };

  const startWarmupTimer = (exerciseIndex: number, setIndex: number) => {
    const key = getLocalSetKey(exerciseIndex, setIndex);
    setActiveWarmupTimer(key);
    impact('light');
  };

  const pauseWarmupTimer = () => {
    setActiveWarmupTimer(null);
    impact('light');
  };

  const resetWarmupTimer = (exerciseIndex: number, setIndex: number) => {
    const key = getLocalSetKey(exerciseIndex, setIndex);
    setWarmupTimers(prev => ({ ...prev, [key]: 0 }));
    setActiveWarmupTimer(null);
    impact('light');
  };

  const addSet = async (exerciseIndex: number) => {
    if (!workout) return;
    await impact('medium');
    try {
      console.log(`Adding new set to exercise ${exerciseIndex}`);
      const exercise = workout.exercises[exerciseIndex];
      const lastSet = exercise.sets[exercise.sets.length - 1];

      const response = await WorkoutService.addSet(
        workout.id,
        exerciseIndex,
        {
          weightKg: lastSet?.weightKg || null,
          reps: lastSet?.reps || null,
          setType: 'NORMAL',
        }
      );

      if (response.success && response.data) {
        setWorkout(response.data as WorkoutSession);
        const newSetIndex = response.data.exercises[exerciseIndex].sets.length - 1;
        const newSet = response.data.exercises[exerciseIndex].sets[newSetIndex];
        const key = getLocalSetKey(exerciseIndex, newSetIndex);

        setLocalSetValues(prev => ({
          ...prev,
          [key]: {
            weightKg: newSet.weightKg?.toString() || '',
            reps: newSet.reps?.toString() || '',
          }
        }));
        setLocalSetTypes(prev => ({ ...prev, [key]: newSet.setType || 'NORMAL' }));

        if (newSet.durationSeconds !== null && newSet.durationSeconds !== undefined) {
          setWarmupTimers(prev => ({ ...prev, [key]: 0 })); // Init new set to 0
        }

        await impact('success');
      }
    } catch (error) {
      console.error('Failed to add set:', error);
      Alert.alert('Error', 'Failed to add set');
    }
  };

  const removeExercise = async (exerciseIndex: number) => {
    if (!workout) return;
    Alert.alert("Exercise Options", "Choose an action", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove Exercise",
        style: "destructive",
        onPress: async () => {
          try {
            await impact('medium');
            const response = await WorkoutService.deleteExercise(workout.id, exerciseIndex);
            if (response.success) {
              // FIX: Use reload with reset=true to handle index shifts safely
              await refreshWorkoutSession(workout.id, true);

              // Clear active timers as indices might have changed
              setActiveRestTimer(null);
              setActiveWarmupTimer(null);
              await impact('success');
            }
          } catch (error) {
            console.error('Failed to remove exercise:', error);
            Alert.alert("Error", "Failed to remove exercise");
          }
        }
      }
    ]);
  };
  const updateRestTimerPreference = (exerciseIndex: number, minutes: number) => {
    const seconds = minutes * 60;
    setRestTimerPreferences(prev => ({ ...prev, [exerciseIndex]: seconds }));
    setShowRestSettings(null);
  };
  const skipRestTimer = () => { setActiveRestTimer(null); setRestTimeRemaining(0); };
  const cancelWorkout = async () => {
    if (!workout) return;
    Alert.alert('Cancel Workout', 'Are you sure you want to cancel? All progress lost.', [
      { text: 'Continue', style: 'cancel' },
      { text: 'Cancel Workout', style: 'destructive', onPress: async () => {
          try { await WorkoutService.cancelWorkout(workout.id); await impact('medium'); router.back(); }
          catch (error) { console.error('Failed to cancel:', error); }
        }},
    ]);
  };
  const finishWorkout = async () => {
    if (!workout) return;

    // Check if workout duration is less than 1 minute (60 seconds)
    if (workoutDurationSeconds < 60) {
      setShowShortWorkoutModal(true);
      return;
    }

    await impact('success');
    Alert.alert('Finish Workout', 'Ready to finish this workout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Finish', onPress: async () => {
          try {
            const response = await WorkoutService.completeWorkout(workout.id);
            if (response.success && response.data) {
              // CRITICAL: Invalidate all challenge and gamification data
              // This ensures that when we navigate back to the challenges screen, it refetches.
              await queryClient.invalidateQueries({ queryKey: ['challenges'] });
              await queryClient.invalidateQueries({ queryKey: ['gamification'] });

              // Refresh to get updated workout with metrics
              const updatedResponse = await WorkoutService.getWorkoutSession(workout.id);
              if (updatedResponse.success && updatedResponse.data) {
                setCompletedWorkout(updatedResponse.data);
                setShowAnalytics(true);
              } else {
                // Fallback to response data if refresh fails
                setCompletedWorkout(response.data);
                setShowAnalytics(true);
              }
            } else {
              Alert.alert('Error', response.message || 'Failed to complete workout');
            }
          } catch (error) {
            console.error('Failed to complete:', error);
            Alert.alert('Error', 'Failed to complete workout');
          }
        }},
    ]);
  };
  const calculateWorkoutStats = () => {
    if (!workout) return { volume: '0 kg', sets: 0 };
    const totalVolume = workout.exercises.reduce((sum, ex) => sum + ex.sets.reduce((setSum, set) => setSum + (set.completed ? (set.weightKg || 0) * (set.reps || 0) : 0), 0), 0);
    const completedSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
    return { volume: `${totalVolume.toFixed(0)} kg`, sets: completedSets };
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Starting workout...</Text>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Failed to load workout</Text>
      </View>
    );
  }

  const stats = calculateWorkoutStats();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.headerLeft}>
          <ChevronDown size={24} color={theme.text} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Log Workout</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => {}} style={styles.timerButton}>
            <Timer size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={finishWorkout}
            style={[styles.finishButton, { backgroundColor: theme.accent }]}
          >
            <Text style={[styles.finishButtonText, { color: theme.cardText }]}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.statsBar, { backgroundColor: theme.background }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Duration</Text>
          <Text style={[styles.statValue, { color: theme.accent }]}>{workoutDuration}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Volume</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{stats.volume}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Sets</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{stats.sets}</Text>
        </View>
        <View style={styles.muscleIcons}>
          <Dumbbell size={20} color={theme.textMuted} />
          <Dumbbell size={20} color={theme.textMuted} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {workout.exercises.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Dumbbell size={48} color={theme.textMuted} />
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
              No Exercises Yet
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: theme.textMuted }]}>
              Add your first exercise to get started
            </Text>
            <TouchableOpacity
              style={[styles.addFirstExerciseButton, { backgroundColor: theme.accent }]}
              onPress={async () => {
                await impact('medium');
                router.push({
                  pathname: '/exercises/add-exercise',
                  params: { sessionId: workout.id },
                });
              }}
            >
              <Plus size={20} color={theme.cardText} />
              <Text style={[styles.addFirstExerciseText, { color: theme.cardText }]}>
                Add Exercise
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          workout.exercises.map((exercise, exerciseIndex) => (
          <ExerciseCard
            key={exerciseIndex}
            exercise={exercise}
            exerciseIndex={exerciseIndex}
            workout={workout}
            theme={theme}
            localSetValues={localSetValues}
            localSetTypes={localSetTypes}
            onUpdateLocalValue={updateLocalValue}
            onToggleComplete={toggleSetComplete}
            onToggleSetType={toggleSetType}
            onAddSet={addSet}
            onRemoveExercise={removeExercise}
            savingSet={savingSet}
            getPreviousSetData={getPreviousSetData}
            isRestTimerActive={activeRestTimer === exerciseIndex}
            restTimeRemaining={activeRestTimer === exerciseIndex ? restTimeRemaining : 0}
            restTimerPreference={restTimerPreferences[exerciseIndex] || 120}
            onSkipRestTimer={skipRestTimer}
            onShowRestSettings={() => setShowRestSettings(exerciseIndex)}
            warmupTimers={warmupTimers}
            activeWarmupTimer={activeWarmupTimer}
            onStartWarmupTimer={startWarmupTimer}
            onPauseWarmupTimer={pauseWarmupTimer}
            onResetWarmupTimer={resetWarmupTimer}
          />
        ))
        )}

        {workout.exercises.length > 0 && (
          <TouchableOpacity
          style={[styles.addExerciseButton, { backgroundColor: theme.surface }]}
          onPress={async () => {
            await impact('medium');
            router.push({
              pathname: '/exercises/add-exercise',
              params: { sessionId: workout.id },
            });
          }}
          activeOpacity={0.7}
        >
          <Plus size={20} color={theme.accent} />
          <Text style={[styles.addExerciseText, { color: theme.accent }]}>Add Exercise</Text>
        </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.error }]}
          onPress={cancelWorkout}
          activeOpacity={0.7}
        >
          <X size={20} color={theme.error} />
          <Text style={[styles.cancelButtonText, { color: theme.error }]}>Cancel Workout</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Rest Timer Settings Modal */}
      {showRestSettings !== null && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowRestSettings(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowRestSettings(null)}>
            <Pressable style={[styles.settingsModal, { backgroundColor: theme.surface }]}>
              <Text style={[styles.settingsTitle, { color: theme.text }]}>Rest Timer</Text>
              <Text style={[styles.settingsSubtitle, { color: theme.textMuted }]}>
                {workout.exercises[showRestSettings].exerciseName}
              </Text>
              <View style={styles.timeOptions}>
                {[1, 1.5, 2, 2.5, 3, 4, 5].map(minutes => (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.timeOption,
                      {
                        backgroundColor: restTimerPreferences[showRestSettings] === minutes * 60
                          ? theme.accent
                          : theme.background,
                        borderColor: theme.accent,
                      }
                    ]}
                    onPress={() => updateRestTimerPreference(showRestSettings, minutes)}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      {
                        color: restTimerPreferences[showRestSettings] === minutes * 60
                          ? theme.cardText
                          : theme.text,
                      }
                    ]}>
                      {minutes}min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Active Rest Timer Modal */}
      {activeRestTimer !== null && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={skipRestTimer}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.timerModal, { backgroundColor: theme.surface }]}>
              <Text style={[styles.timerTitle, { color: theme.text }]}>Rest Timer</Text>
              <Text style={[styles.timerExerciseName, { color: theme.textMuted }]}>
                {workout.exercises[activeRestTimer].exerciseName}
              </Text>
              <View style={styles.timerControls}>
                <TouchableOpacity
                  onPress={() => setRestTimeRemaining(prev => Math.max(0, prev - 15))}
                  style={[styles.timerAdjustButton, { backgroundColor: theme.background }]}
                >
                  <Text style={[styles.timerAdjustText, { color: theme.text }]}>-15</Text>
                </TouchableOpacity>
                <Text style={[styles.timerDisplay, { color: theme.accent }]}>
                  {Math.floor(restTimeRemaining / 60)}:{(restTimeRemaining % 60).toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  onPress={() => setRestTimeRemaining(prev => prev + 15)}
                  style={[styles.timerAdjustButton, { backgroundColor: theme.background }]}
                >
                  <Text style={[styles.timerAdjustText, { color: theme.text }]}>+15</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.skipButton, { backgroundColor: theme.accent }]}
                onPress={async () => {
                  await impact('light');
                  skipRestTimer();
                }}
              >
                <Text style={[styles.skipButtonText, { color: theme.cardText }]}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Short Workout Warning Modal */}
      <Modal
        visible={showShortWorkoutModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowShortWorkoutModal(false)}
      >
        <View style={styles.centeredModalOverlay}>
          <View style={[styles.shortWorkoutModal, { backgroundColor: theme.surface }]}>
            <View style={styles.shortWorkoutHeader}>
              <Text style={[styles.shortWorkoutTitle, { color: theme.text }]}>
                Workout Too Short
              </Text>
            </View>

            <Text style={[styles.shortWorkoutMessage, { color: theme.text }]}>
              You cannot finish a workout if you've been training for less than 1 minute.
            </Text>

            <Text style={[styles.shortWorkoutSubMessage, { color: theme.textMuted }]}>
              If you want to discard this workout, press "Discard Workout" below.
            </Text>

            <View style={styles.shortWorkoutActions}>
              <TouchableOpacity
                style={[styles.discardButton, { backgroundColor: theme.error }]}
                onPress={async () => {
                  if (!workout) return;
                  await impact('medium');
                  setShowShortWorkoutModal(false);
                  try {
                    await WorkoutService.cancelWorkout(workout.id);
                    router.back();
                  } catch (error) {
                    console.error('Failed to discard workout:', error);
                    Alert.alert('Error', 'Failed to discard workout');
                  }
                }}
              >
                <Text style={[styles.discardButtonText, { color: '#FFFFFF' }]}>
                  Discard Workout
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.continueButton, { borderColor: theme.accent }]}
                onPress={() => {
                  setShowShortWorkoutModal(false);
                  impact('light');
                }}
              >
                <Text style={[styles.continueButtonText, { color: theme.accent }]}>
                  Continue Training
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Workout Analytics Modal */}
      <WorkoutAnalytics
        visible={showAnalytics}
        workout={completedWorkout}
        onClose={() => {
          setShowAnalytics(false);
          router.back();
        }}
      />
    </View>
  );
}

// Exercise Card Component
interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  workout: WorkoutSession;
  theme: any;
  localSetValues: Record<string, LocalSetData>;
  localSetTypes: Record<string, string>;
  onUpdateLocalValue: (exerciseIndex: number, setIndex: number, field: 'weightKg' | 'reps', value: string) => void;
  onToggleComplete: (exerciseIndex: number, setIndex: number) => void;
  onToggleSetType: (exerciseIndex: number, setIndex: number) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  savingSet: boolean;
  getPreviousSetData: (exerciseIndex: number, setIndex: number) => WorkoutSet | null;
  isRestTimerActive: boolean;
  restTimeRemaining: number;
  restTimerPreference: number;
  onSkipRestTimer: () => void;
  onShowRestSettings: () => void;
  warmupTimers: Record<string, number>;
  activeWarmupTimer: string | null;
  onStartWarmupTimer: (exerciseIndex: number, setIndex: number) => void;
  onPauseWarmupTimer: () => void;
  onResetWarmupTimer: (exerciseIndex: number, setIndex: number) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
                                                     exercise,
                                                     exerciseIndex,
                                                     theme,
                                                     localSetValues,
                                                     localSetTypes,
                                                     onUpdateLocalValue,
                                                     onToggleComplete,
                                                     onToggleSetType,
                                                     onAddSet,
                                                     onRemoveExercise,
                                                     savingSet,
                                                     getPreviousSetData,
                                                     isRestTimerActive,
                                                     restTimeRemaining,
                                                     restTimerPreference,
                                                     onSkipRestTimer,
                                                     onShowRestSettings,
                                                     warmupTimers,
                                                     activeWarmupTimer,
                                                     onStartWarmupTimer,
                                                     onPauseWarmupTimer,
                                                     onResetWarmupTimer,
                                                   }) => {
  const getLocalValue = (setIndex: number, field: 'weightKg' | 'reps') => {
    const key = `${exerciseIndex}-${setIndex}`;
    return localSetValues[key]?.[field] || '';
  };

  const isDurationExercise = exercise.sets.length > 0 &&
    exercise.sets[0].durationSeconds !== null && exercise.sets[0].durationSeconds !== undefined;

  const formatRestTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0 && secs > 0) return `${mins}min ${secs}s`;
    else if (mins > 0) return `${mins}min`;
    else return `${secs}s`;
  };

  const hasPR = (set: WorkoutSet, type?: string) => {
    if (!set.personalRecords || set.personalRecords.length === 0) return false;
    if (type) return set.personalRecords.includes(type);
    return true;
  };

  const getPRIcons = (prTypes: string[] | null) => {
    if (!prTypes || prTypes.length === 0) return [];
    const iconMap: Record<string, { icon: any; emoji: string }> = {
      MAX_WEIGHT: { icon: Trophy, emoji: '💪' },
      MAX_REPS: { icon: Flame, emoji: '🔥' },
      MAX_VOLUME: { icon: TrendingUp, emoji: '📊' },
      ESTIMATED_1RM: { icon: Star, emoji: '⭐' },
    };
    return prTypes.map(type => iconMap[type] || { icon: Award, emoji: '🏆' });
  };

  let normalSetCount = 0;
  const setsWithDisplay = exercise.sets.map((s, idx) => {
    const key = `${exerciseIndex}-${idx}`;
    const type = localSetTypes[key] || s.setType || 'NORMAL';
    let label = '';
    let color = theme.text;
    if (type === 'NORMAL') {
      normalSetCount++;
      label = normalSetCount.toString();
    } else if (type === 'WARMUP') {
      label = 'W';
      color = '#FFD700';
    } else if (type === 'DROP') {
      label = 'D';
      color = '#FF453A';
    } else if (type === 'FAILURE') {
      label = 'F';
      color = '#FF3B30';
    }
    return { ...s, displayLabel: label, displayColor: color };
  });

  return (
    <View style={[styles.exerciseCard, { backgroundColor: theme.background }]}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseInfo}>
          <View style={[styles.exerciseIcon, { backgroundColor: theme.accent + '20' }]}>
            <Dumbbell size={20} color={theme.accent} />
          </View>
          <Text style={[styles.exerciseName, { color: theme.accent }]}>{exercise.exerciseName}</Text>
        </View>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => onRemoveExercise(exerciseIndex)}
        >
          <MoreVertical size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {exercise.notes && (
        <Text style={[styles.exerciseNotes, { color: theme.textSecondary }]}>{exercise.notes}</Text>
      )}

      <TextInput
        style={[styles.notesInput, { color: theme.textMuted, borderColor: theme.surface }]}
        placeholder="Add notes here..."
        placeholderTextColor={theme.textMuted}
        multiline
      />

      {!isDurationExercise && (
        <View style={styles.restTimerContainer}>
          <TouchableOpacity
            style={[styles.restBadge, { backgroundColor: theme.accent + '15' }]}
            onPress={onShowRestSettings}
            activeOpacity={0.7}
          >
            <Timer size={14} color={theme.accent} />
            <Text style={[styles.restBadgeText, { color: theme.accent }]}>
              Rest Timer: {formatRestTime(restTimerPreference)}
            </Text>
            <Settings size={12} color={theme.accent} />
          </TouchableOpacity>

          {isRestTimerActive && restTimeRemaining > 0 && (
            <View style={[styles.activeTimer, { backgroundColor: theme.accent }]}>
              <Text style={[styles.activeTimerText, { color: theme.cardText }]}>
                {Math.floor(restTimeRemaining / 60)}:{(restTimeRemaining % 60).toString().padStart(2, '0')}
              </Text>
              <TouchableOpacity onPress={onSkipRestTimer}>
                <Text style={[styles.skipTimerText, { color: theme.cardText }]}>Skip</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {isDurationExercise ? (
        <>
          <View style={[styles.tableHeader, { borderBottomColor: theme.surface }]}>
            <Text style={[styles.headerText, styles.setCol, { color: theme.textMuted }]}>SET</Text>
            <Text style={[styles.headerText, styles.prevCol, { color: theme.textMuted }]}>PREVIOUS</Text>
            <Text style={[styles.headerText, { flex: 1, color: theme.textMuted }]}>TIME</Text>
            <View style={styles.checkCol} />
          </View>

          {setsWithDisplay.map((set, setIndex) => {
            const prevSet = getPreviousSetData(exerciseIndex, setIndex);
            const isCompleted = set.completed;
            const key = `${exerciseIndex}-${setIndex}`;
            const currentTime = warmupTimers[key] !== undefined ? warmupTimers[key] : 0; // FIX: use undefined check to start from 0
            const isActive = activeWarmupTimer === key;
            const minutes = Math.floor(currentTime / 60);
            const seconds = currentTime % 60;

            return (
              <View key={setIndex} style={[styles.setRow, isCompleted && { backgroundColor: theme.accent + '15' }]}>
                <TouchableOpacity style={styles.setCol} onPress={() => onToggleSetType(exerciseIndex, setIndex)}>
                  <Text style={[styles.setText, { color: set.displayColor === theme.text && isCompleted ? theme.accent : set.displayColor }]}>
                    {set.displayLabel}
                  </Text>
                </TouchableOpacity>

                <View style={styles.prevCol}>
                  {prevSet && prevSet.durationSeconds ? (
                    <Text style={[styles.prevText, { color: theme.textMuted }]}>
                      {Math.floor(prevSet.durationSeconds / 60)}:{(prevSet.durationSeconds % 60).toString().padStart(2, '0')}
                    </Text>
                  ) : (
                    <Text style={[styles.prevText, { color: theme.textMuted }]}>-</Text>
                  )}
                </View>

                <View style={{ flex: 1, alignItems: 'center' }}>
                  <View style={styles.timerControls}>
                    {!isCompleted && (
                      <>
                        <TouchableOpacity
                          onPress={() => isActive ? onPauseWarmupTimer() : onStartWarmupTimer(exerciseIndex, setIndex)}
                          style={[styles.timerControlButton, { backgroundColor: theme.accent + '20' }]}
                        >
                          {isActive ? <Pause size={16} color={theme.accent} /> : <Play size={16} color={theme.accent} />}
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => onResetWarmupTimer(exerciseIndex, setIndex)}
                          style={[styles.timerControlButton, { backgroundColor: theme.surface }]}
                        >
                          <Text style={[styles.timerControlText, { color: theme.textMuted }]}>Reset</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    <View style={[styles.timerDisplayBox, { backgroundColor: isCompleted ? theme.accent + '20' : theme.accent + '30' }]}>
                      <Text style={[styles.timerText, { color: isActive ? theme.accent : theme.text }]}>
                        {minutes}:{seconds.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.checkCol} onPress={() => onToggleComplete(exerciseIndex, setIndex)} disabled={savingSet}>
                  <View style={[styles.squareCheckbox, { backgroundColor: isCompleted ? theme.accent : 'transparent', borderColor: isCompleted ? theme.accent : theme.textMuted }]}>
                    {isCompleted && <Check size={16} color={theme.cardText} />}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </>
      ) : (
        <>
          <View style={[styles.tableHeader, { borderBottomColor: theme.surface }]}>
            <Text style={[styles.headerText, styles.setCol, { color: theme.textMuted }]}>SET</Text>
            <Text style={[styles.headerText, styles.prevCol, { color: theme.textMuted }]}>PREVIOUS</Text>
            <Text style={[styles.headerText, styles.kgCol, { color: theme.textMuted }]}>KG</Text>
            <Text style={[styles.headerText, styles.repsCol, { color: theme.textMuted }]}>REPS</Text>
            <View style={styles.checkCol} />
          </View>

          {setsWithDisplay.map((set, setIndex) => {
            const prevSet = getPreviousSetData(exerciseIndex, setIndex);
            const isCompleted = set.completed;
            const isPR = hasPR(set);

            return (
              <View key={setIndex} style={[styles.setRow, isCompleted && { backgroundColor: theme.accent + '15' }]}>
                <TouchableOpacity style={styles.setCol} onPress={() => onToggleSetType(exerciseIndex, setIndex)}>
                  <View style={styles.setNumberContainer}>
                    <Text style={[styles.setText, { color: set.displayColor === theme.text && isCompleted ? theme.accent : set.displayColor }]}>
                      {set.displayLabel}
                    </Text>
                    {isPR && set.personalRecords && set.personalRecords.length > 0 && (
                      <View style={styles.prBadgesContainer}>
                        {getPRIcons(set.personalRecords).map((prIcon, idx) => {
                          const IconComponent = prIcon.icon;
                          return (
                            <View key={idx} style={[styles.prBadge, { backgroundColor: '#FFD700' }]}>
                              <IconComponent size={10} color="#000" />
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.prevCol}>
                  {prevSet && prevSet.weightKg && prevSet.reps ? (
                    <Text style={[styles.prevText, { color: theme.textMuted }]}>
                      {prevSet.weightKg}kg × {prevSet.reps}
                    </Text>
                  ) : (
                    <Text style={[styles.prevText, { color: theme.textMuted }]}>-</Text>
                  )}
                </View>

                <View style={styles.kgCol}>
                  <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: isCompleted ? theme.accent + '20' : theme.surface, borderColor: isCompleted ? theme.accent : theme.surface }]}
                    value={getLocalValue(setIndex, 'weightKg')}
                    onChangeText={(text) => onUpdateLocalValue(exerciseIndex, setIndex, 'weightKg', text)}
                    keyboardType="decimal-pad"
                    placeholder="-"
                    placeholderTextColor={theme.textMuted}
                    editable={!isCompleted}
                  />
                </View>

                <View style={styles.repsCol}>
                  <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: isCompleted ? theme.accent + '20' : theme.surface, borderColor: isCompleted ? theme.accent : theme.surface }]}
                    value={getLocalValue(setIndex, 'reps')}
                    onChangeText={(text) => onUpdateLocalValue(exerciseIndex, setIndex, 'reps', text)}
                    keyboardType="number-pad"
                    placeholder="-"
                    placeholderTextColor={theme.textMuted}
                    editable={!isCompleted}
                  />
                </View>

                <TouchableOpacity style={styles.checkCol} onPress={() => onToggleComplete(exerciseIndex, setIndex)} disabled={savingSet}>
                  <View style={[styles.squareCheckbox, { backgroundColor: isCompleted ? theme.accent : 'transparent', borderColor: isCompleted ? theme.accent : theme.textMuted }]}>
                    {isCompleted && <Check size={16} color={theme.cardText} />}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </>
      )}

      <TouchableOpacity style={styles.addSetButton} onPress={() => onAddSet(exerciseIndex)} activeOpacity={0.7}>
        <Plus size={16} color={theme.text} />
        <Text style={[styles.addSetText, { color: theme.text }]}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timerButton: { padding: 8 },
  finishButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  finishButtonText: { fontSize: 15, fontWeight: '600' },
  statsBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  statItem: { alignItems: 'center', marginRight: 32 },
  statLabel: { fontSize: 11, marginBottom: 2 },
  statValue: { fontSize: 15, fontWeight: '600' },
  muscleIcons: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
  content: { flex: 1 },
  exerciseCard: { padding: 16, borderBottomWidth: 8, borderBottomColor: 'rgba(0,0,0,0.2)' },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  exerciseInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  exerciseIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  exerciseName: { fontSize: 16, fontWeight: '600', flex: 1 },
  exerciseNotes: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  notesInput: { fontSize: 13, paddingVertical: 8, paddingHorizontal: 0, marginBottom: 12, borderBottomWidth: 1 },
  restTimerContainer: { marginBottom: 12 },
  restBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start' },
  restBadgeText: { fontSize: 12, fontWeight: '500' },
  activeTimer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, marginTop: 8 },
  activeTimerText: { fontSize: 18, fontWeight: 'bold' },
  skipTimerText: { fontSize: 14, fontWeight: '600' },
  tableHeader: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, marginBottom: 4 },
  headerText: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderRadius: 6, marginBottom: 4 },
  setCol: { width: 40, alignItems: 'center' },
  setNumberContainer: { alignItems: 'center', gap: 2 },
  prBadgesContainer: { flexDirection: 'row', gap: 2, marginTop: 2 },
  prBadge: { width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  prBadgeText: { fontSize: 8, fontWeight: 'bold', color: '#000' },
  prevCol: { flex: 1.2, paddingHorizontal: 4 },
  kgCol: { flex: 0.8, paddingHorizontal: 4 },
  repsCol: { flex: 0.8, paddingHorizontal: 4 },
  checkCol: { width: 40, alignItems: 'center' },
  setText: { fontSize: 15, fontWeight: '600' },
  prevText: { fontSize: 12, textAlign: 'center' },
  input: { height: 36, borderRadius: 6, borderWidth: 1, textAlign: 'center', fontSize: 14, fontWeight: '500' },
  timerDisplayBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  timerText: { fontSize: 14, fontWeight: '600' },
  timerControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerControlButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  timerControlText: { fontSize: 10, fontWeight: '600' },
  squareCheckbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  addSetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, marginTop: 8 },
  addSetText: { fontSize: 14, fontWeight: '500' },
  addExerciseButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, marginHorizontal: 16, marginTop: 16, borderRadius: 12 },
  addExerciseText: { fontSize: 16, fontWeight: '600' },
  cancelButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, marginHorizontal: 16, marginTop: 12, borderRadius: 12, borderWidth: 2 },
  cancelButtonText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'flex-end' },
  centeredModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center' },
  settingsModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 },
  settingsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  settingsSubtitle: { fontSize: 14, marginBottom: 24 },
  timeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  timeOption: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, borderWidth: 2 },
  timeOptionText: { fontSize: 14, fontWeight: '600' },
  timerModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32, paddingBottom: 48, alignItems: 'center' },
  timerTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  timerExerciseName: { fontSize: 14, marginBottom: 24 },
  timerAdjustButton: { width: 60, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  timerAdjustText: { fontSize: 14, fontWeight: '600' },
  timerDisplay: { fontSize: 56, fontWeight: 'bold', minWidth: 140, textAlign: 'center' },
  skipButton: { paddingHorizontal: 64, paddingVertical: 14, borderRadius: 12 },
  skipButtonText: { fontSize: 16, fontWeight: '600' },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstExerciseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  shortWorkoutModal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  shortWorkoutHeader: {
    marginBottom: 16,
  },
  shortWorkoutTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shortWorkoutMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  shortWorkoutSubMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  shortWorkoutActions: {
    width: '100%',
    gap: 12,
  },
  discardButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  discardButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
