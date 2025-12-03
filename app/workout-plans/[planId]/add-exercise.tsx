// app/workout-plans/[planId]/add-exercise.tsx

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
import { ArrowLeft, Search, Dumbbell, Check } from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import {
  WorkoutPlanService,
  Exercise,
  AddExerciseToWorkoutPlanRequest,
} from '@/services';
import { useHaptics } from '@/hooks/useHaptics';

export default function AddExerciseScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadExercises();
  }, [searchQuery]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const response = await WorkoutPlanService.browseExercises(searchQuery);

      if (response.success && response.data) {
        setExercises(response.data);
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = async (exercise: Exercise) => {
    await impact('medium');

    const exerciseData: AddExerciseToWorkoutPlanRequest = {
      exerciseTemplateId: exercise.id,
      title: exercise.name,
      notes: '',
      sets: [
        { setNumber: 1, reps: 10, type: 'NORMAL' },
        { setNumber: 2, reps: 10, type: 'NORMAL' },
        { setNumber: 3, reps: 10, type: 'NORMAL' },
      ],
      restSeconds: 120,
    };

    setAdding(true);

    try {
      const response = await WorkoutPlanService.addExerciseToWorkoutPlan(
        planId,
        exerciseData
      );

      if (response.success) {
        await impact('success');
        Alert.alert('Success', 'Exercise added to plan!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Failed to add exercise:', error);
      Alert.alert('Error', 'Failed to add exercise to plan');
      await impact('error');
    } finally {
      setAdding(false);
    }
  };

  return (
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Add Exercise</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.surface }]}>
          <Search size={20} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
            placeholderTextColor={theme.textMuted}
          />
        </View>
      </View>

      {/* Exercise List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: theme.textMuted }]}>
              No exercises found
            </Text>
          </View>
        ) : (
          exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={[styles.exerciseItem, { backgroundColor: theme.surface }]}
              onPress={() => handleAddExercise(exercise)}
              disabled={adding}
              activeOpacity={0.7}
            >
              <View style={[styles.exerciseIcon, { backgroundColor: theme.accent + '20' }]}>
                <Dumbbell size={24} color={theme.accent} />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={[styles.exerciseName, { color: theme.text }]}>
                  {exercise.name}
                </Text>
                <Text style={[styles.exerciseCategory, { color: theme.textMuted }]}>
                  {exercise.category} • {exercise.primaryMuscles.join(', ')}
                </Text>
              </View>
              {selectedExercise?.id === exercise.id && adding && (
                <ActivityIndicator size="small" color={theme.accent} />
              )}
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 15,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 13,
  },
});
