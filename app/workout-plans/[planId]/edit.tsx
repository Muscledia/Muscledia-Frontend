// app/workout-plans/[planId]/edit.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Clock,
  Dumbbell,
  X
} from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { WorkoutPlanService } from '@/services';
import { WorkoutPlan, PlannedSet } from '@/types';
import { useHaptics } from '@/hooks/useHaptics';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Check } from 'lucide-react-native';


export default function EditRoutineScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');

  // FIX: Use useFocusEffect to reload data when returning from "Add Exercise" screen
  useFocusEffect(
    useCallback(() => {
      loadPlan();
    }, [planId])
  );

  const loadPlan = async () => {
    if (!planId) return;
    try {
      // Only show full spinner on first load to prevent flickering
      if (!plan) setLoading(true);

      const response = await WorkoutPlanService.getWorkoutPlanById(planId);
      if (response.success && response.data) {
        const safePlan = {
          ...response.data,
          exercises: response.data.exercises || []
        };
        setPlan(safePlan);
        setTitle(prevTitle => prevTitle || safePlan.title);
      } else {
        Alert.alert('Error', 'Routine not found');
        router.back();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load routine');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!planId || !plan) return;

    // 1. Snapshot previous state for rollback
    const previousPlan = { ...plan };
    const previousTitle = title;

    // 2. OPTIMISTIC UPDATE: Update local state immediately
    // Note: We don't need to 'setPlan' here because 'title' is separate state,
    // but if we were staying on this screen, we would.
    // Since we are navigating back, the "optimistic" part is assuming success and leaving.

    setSaving(true);
    await impact('medium');

    try {
      // Construct payload
      const payload = {
        ...plan,
        title: title,
        exercises: plan.exercises,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined
      };

      // 3. Perform API call
      const response = await WorkoutPlanService.updateWorkoutPlan(planId, payload);

      if (response.success) {
        await impact('success');
        router.back();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      // 4. ROLLBACK (If we were staying on screen)
      // Since we didn't mutate 'plan' state directly for title, we just alert.
      // If we had mutated 'plan.exercises', we would do: setPlan(previousPlan);

      console.error("Update failed:", error);
      Alert.alert('Error', error.message || 'Failed to update routine');
    } finally {
      setSaving(false);
    }
  };

  // --- Local State Modifiers (Instant UI Updates) ---

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof PlannedSet, value: any) => {
    if (!plan || !plan.exercises) return;

    // OPTIMISTIC UPDATE: Modify state immediately
    const newExercises = [...plan.exercises];
    if (!newExercises[exerciseIndex].sets[setIndex]) return;

    newExercises[exerciseIndex].sets[setIndex] = {
      ...newExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setPlan({ ...plan, exercises: newExercises });
  };

  const addSet = (exerciseIndex: number) => {
    if (!plan || !plan.exercises) return;
    impact('light');

    // OPTIMISTIC UPDATE
    const newExercises = [...plan.exercises];
    if (!newExercises[exerciseIndex].sets) {
      newExercises[exerciseIndex].sets = [];
    }

    const currentSets = newExercises[exerciseIndex].sets;
    const prevSet = currentSets[currentSets.length - 1];

    currentSets.push({
      setNumber: currentSets.length + 1,
      type: 'NORMAL',
      weightKg: prevSet?.weightKg || 0,
      reps: prevSet?.reps || 0,
    });
    setPlan({ ...plan, exercises: newExercises });
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    if (!plan || !plan.exercises) return;
    impact('warning');

    // OPTIMISTIC UPDATE
    const newExercises = [...plan.exercises];
    if (!newExercises[exerciseIndex].sets) return;

    newExercises[exerciseIndex].sets.splice(setIndex, 1);
    // Renumber
    newExercises[exerciseIndex].sets = newExercises[exerciseIndex].sets.map((s, i) => ({
      ...s,
      setNumber: i + 1
    }));
    setPlan({ ...plan, exercises: newExercises });
  };

  const removeExercise = (exerciseIndex: number) => {
    if (!plan || !plan.exercises) return;
    impact('heavy');

    Alert.alert('Remove Exercise', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          // OPTIMISTIC UPDATE
          const newExercises = [...plan.exercises];
          newExercises.splice(exerciseIndex, 1);
          setPlan({ ...plan, exercises: newExercises });
        }
      }
    ]);
  };

  const handleNotesChange = (exerciseIndex: number, text: string) => {
    if (!plan || !plan.exercises) return;
    // OPTIMISTIC UPDATE
    const newExercises = [...plan.exercises];
    newExercises[exerciseIndex].notes = text;
    setPlan({ ...plan, exercises: newExercises });
  };

  if (loading || !plan) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  // --- Calculations ---
  const safeExercises = plan.exercises || [];
  const totalSets = safeExercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <ScreenHeader
        title="Edit Routine"
        leftAction={{
          icon: <Text style={{ color: theme.text, fontSize: 16 }}>Cancel</Text>,
          onPress: () => router.back()
        }}
        rightAction={{
          icon: saving
            ? <ActivityIndicator size="small" color={theme.accent} />
            : <Check size={24} color={theme.accent} />,
          onPress: handleUpdate,
          disabled: saving
        }}
        theme={theme}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <TextInput
              style={[styles.planTitleInput, { color: theme.text }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Routine Name"
              placeholderTextColor={theme.textMuted}
            />
            <Text style={[styles.createdBy, { color: theme.textMuted }]}>
              Editing Mode
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
                {safeExercises.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Exercises</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: theme.surface }]} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>{totalSets}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Sets</Text>
            </View>
          </View>

          {/* Exercises Header */}
          <View style={styles.exercisesHeader}>
            <Text style={[styles.exercisesTitle, { color: theme.text }]}>Exercises</Text>

            <TouchableOpacity
              onPress={() => router.push({ pathname: '/exercises/add-exercise', params: { planId } })}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Plus size={16} color={theme.accent} />
              <Text style={{ color: theme.accent, fontWeight: '600' }}>Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {/* Editable Exercises List */}
          {safeExercises.map((exercise, exIndex) => (
            <View key={exIndex} style={[styles.exerciseCard, { backgroundColor: theme.surface }]}>

              {/* Card Header */}
              <View style={styles.exerciseCardHeader}>
                <View style={[styles.exerciseIcon, { backgroundColor: theme.accent + '20' }]}>
                  <Dumbbell size={20} color={theme.accent} />
                </View>
                <Text style={[styles.exerciseTitle, { color: theme.accent }]}>
                  {exercise.title || exercise.name}
                </Text>
                <TouchableOpacity onPress={() => removeExercise(exIndex)} style={{ padding: 4 }}>
                  <Trash2 size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Notes Input */}
              <TextInput
                style={[styles.notesInput, { color: theme.textSecondary, backgroundColor: theme.background }]}
                value={exercise.notes}
                onChangeText={(text) => handleNotesChange(exIndex, text)}
                placeholder="Add notes..."
                placeholderTextColor={theme.textMuted}
                multiline
              />

              {/* Rest Timer */}
              <View style={styles.restTimer}>
                <Clock size={14} color={theme.textMuted} />
                <Text style={[styles.restTimerText, { color: theme.textMuted }]}>
                  {exercise.restSeconds ? `${Math.floor(exercise.restSeconds / 60)}min ${exercise.restSeconds % 60}s` : 'No Rest Timer'}
                </Text>
              </View>

              {/* Sets Table */}
              <View style={styles.setsTable}>
                {/* Table Header */}
                <View style={[styles.tableHeader, { borderBottomColor: theme.background }]}>
                  <Text style={[styles.tableHeaderText, { color: theme.textMuted }]}>SET</Text>
                  <Text style={[styles.tableHeaderText, { color: theme.textMuted }]}>KG</Text>
                  <Text style={[styles.tableHeaderText, { color: theme.textMuted }]}>REPS</Text>
                  <Text style={[styles.tableHeaderText, { color: theme.textMuted, width: 30 }]}></Text>
                </View>

                {/* Sets Rows */}
                {(exercise.sets || []).map((set, setIndex) => {
                  const isWarmup = set.type === 'WARMUP';
                  return (
                    <View key={setIndex} style={[styles.setRow, { backgroundColor: isWarmup ? theme.accent + '10' : 'transparent' }]}>
                      {/* Set Type Toggle */}
                      <TouchableOpacity
                        style={styles.setNumberContainer}
                        onPress={() => updateSet(exIndex, setIndex, 'type', set.type === 'NORMAL' ? 'WARMUP' : 'NORMAL')}
                      >
                        <Text style={[styles.setNumber, { color: isWarmup ? theme.accent : theme.text }]}>
                          {isWarmup ? 'W' : set.setNumber}
                        </Text>
                      </TouchableOpacity>

                      {/* Weight Input */}
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        value={set.weightKg !== null && set.weightKg !== undefined ? set.weightKg.toString() : ''}
                        placeholder="-"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="numeric"
                        onChangeText={(val) => updateSet(exIndex, setIndex, 'weightKg', parseFloat(val) || 0)}
                      />

                      {/* Reps Input */}
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        value={set.reps !== null && set.reps !== undefined ? set.reps.toString() : ''}
                        placeholder="-"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="numeric"
                        onChangeText={(val) => updateSet(exIndex, setIndex, 'reps', parseFloat(val) || 0)}
                      />

                      {/* Delete Set */}
                      <TouchableOpacity
                        onPress={() => removeSet(exIndex, setIndex)}
                        style={{ width: 30, alignItems: 'flex-end' }}
                      >
                        <X size={16} color={theme.textMuted} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {/* Add Set Button */}
              <TouchableOpacity
                style={[styles.addSetButton, { backgroundColor: theme.background }]}
                onPress={() => addSet(exIndex)}
              >
                <Plus size={14} color={theme.text} />
                <Text style={[styles.addSetText, { color: theme.text }]}>Add Set</Text>
              </TouchableOpacity>

            </View>
          ))}

          {/* Save Changes Button (Matches Start Routine Button style) */}
          <TouchableOpacity
            onPress={handleUpdate}
            activeOpacity={0.9}
            style={styles.startButton}
          >
            <LinearGradient
              colors={[theme.accent, theme.accentSecondary]}
              locations={[0.55, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startGradient}
            >
              <Text style={[styles.startButtonText, { color: theme.cardText }]}>
                Save Changes
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },

  // Header matched to Detail Screen
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },

  content: { flex: 1 },

  // Title Section
  titleSection: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  planTitleInput: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.2)' },
  createdBy: { fontSize: 14 },

  // Stats Section (Same as Detail)
  statsSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, height: 40 },

  // Buttons
  startButton: { marginHorizontal: 16, marginVertical: 20, borderRadius: 12, overflow: 'hidden' },
  startGradient: { paddingVertical: 16, alignItems: 'center' },
  startButtonText: { fontSize: 17, fontWeight: '600' },

  // Exercise List
  exercisesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  exercisesTitle: { fontSize: 20, fontWeight: 'bold' },

  exerciseCard: { marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12 },
  exerciseCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  exerciseIcon: { width: 40, height: 40, borderRadius: 20, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  exerciseTitle: { fontSize: 17, fontWeight: '600', flex: 1 },

  notesInput: { fontSize: 13, borderRadius: 6, padding: 8, marginBottom: 12, minHeight: 40 },
  restTimer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  restTimerText: { fontSize: 13, fontWeight: '500' },

  // Table
  setsTable: { marginTop: 8 },
  tableHeader: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, marginBottom: 8 },
  tableHeaderText: { flex: 1, fontSize: 11, fontWeight: '700', textAlign: 'center' },

  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderRadius: 6, marginBottom: 4 },
  setNumberContainer: { flex: 1, alignItems: 'center' },
  setNumber: { fontSize: 15, fontWeight: '600' },

  input: { flex: 1, fontSize: 15, textAlign: 'center', padding: 4, borderRadius: 4, backgroundColor: 'rgba(128,128,128,0.1)' },

  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
    gap: 6
  },
  addSetText: { fontSize: 14, fontWeight: '600' }
});
