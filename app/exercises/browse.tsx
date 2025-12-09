import React from 'react';
import { View, StyleSheet, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { ExerciseBrowser } from '@/components/exercises/ExerciseBrowser';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { WorkoutPlanService, WorkoutService } from '@/services';
import { Exercise } from '@/types/api';
import { useHaptics } from '@/hooks/useHaptics';

export default function ExerciseBrowserScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ planId?: string; sessionId?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

  const targetPlanId = params.planId;
  const currentWorkoutId = params.sessionId;

  // --- Helper Functions ---
  const mapDifficulty = (difficulty?: string): string => {
    if (!difficulty) return 'INTERMEDIATE';
    const upper = difficulty.toUpperCase();
    return ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(upper) ? upper : 'INTERMEDIATE';
  };

  const mapCategory = (category?: string): string => {
    if (!category) return 'STRENGTH';
    const upper = category.toUpperCase();
    return ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'SPORTS', 'OTHER'].includes(upper) ? upper : 'STRENGTH';
  };

  const formatInstructionsArray = (instructions?: string | string[]): string[] => {
    if (!instructions) return [];
    if (Array.isArray(instructions)) {
      return instructions.filter(line => line && line.trim().length > 0);
    }
    if (typeof instructions === 'string') {
      return instructions.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    }
    return [];
  };

  const removeNullValues = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(v => removeNullValues(v));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const value = removeNullValues(obj[key]);
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
    }
    return obj;
  };

  const handleSelectExercise = async (exercise: Exercise) => {
    await impact('medium');
    if (targetPlanId) {
      await addExerciseToPlan(exercise);
    } else if (currentWorkoutId) {
      await addExerciseToSession(exercise);
    } else {
      Alert.alert('Error', 'No workout plan or session specified');
    }
  };

  // --- Add to Workout Plan (Template) ---
  const addExerciseToPlan = async (exercise: Exercise) => {
    if (!targetPlanId) return;

    try {
      const rawPayload = {
        exerciseTemplateId: exercise.id,
        title: exercise.name,
        notes: exercise.description || '',
        instructions: formatInstructionsArray(exercise.instructions),
        bodyPart: exercise.bodyPart,
        equipment: exercise.equipment,
        targetMuscle: exercise.targetMuscle,
        secondaryMuscles: exercise.secondaryMuscles || [],
        difficulty: mapDifficulty(exercise.difficulty),
        category: mapCategory(exercise.category),
        numberOfSets: 3,
        targetReps: 10,
        restSeconds: 120,
        sets: [
          { setNumber: 1, type: 'NORMAL', reps: 10 },
          { setNumber: 2, type: 'NORMAL', reps: 10 },
          { setNumber: 3, type: 'NORMAL', reps: 10 }
        ]
      };

      const payload = removeNullValues(rawPayload);
      console.log('Adding to Plan Payload:', JSON.stringify(payload, null, 2));

      const response = await WorkoutPlanService.addExerciseToWorkoutPlan(
        targetPlanId,
        payload
      );

      if (response.success) {
        await impact('success');
        Alert.alert('Success', `Added ${exercise.name} to plan`);
        router.back();
      } else {
        throw new Error(response.message || 'Failed to add exercise');
      }
    } catch (error: any) {
      console.error('Add to Plan Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Could not add exercise to plan');
    }
  };

  // --- Add to Active Session ---
  const addExerciseToSession = async (exercise: Exercise) => {
    if (!currentWorkoutId) return;

    try {
      const rawPayload = {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        notes: exercise.description || '',
        exerciseCategory: mapCategory(exercise.category),
        primaryMuscleGroup: exercise.targetMuscle || 'unknown',
        secondaryMuscleGroups: exercise.secondaryMuscles || [],
        equipment: exercise.equipment || 'none',
        bodyPart: exercise.bodyPart,
        targetMuscle: exercise.targetMuscle,
        difficulty: mapDifficulty(exercise.difficulty),
        category: mapCategory(exercise.category),
        sets: [
          { setNumber: 1, setType: 'NORMAL', completed: false, weightKg: 0, reps: 0 },
          { setNumber: 2, setType: 'NORMAL', completed: false, weightKg: 0, reps: 0 },
          { setNumber: 3, setType: 'NORMAL', completed: false, weightKg: 0, reps: 0 }
        ]
      };

      const payload = removeNullValues(rawPayload);
      console.log('Adding to Session Payload:', JSON.stringify(payload, null, 2));

      const response = await WorkoutService.addExerciseToSession(
        currentWorkoutId,
        payload
      );

      if (response.success) {
        await impact('success');
        Alert.alert('Success', `Added ${exercise.name} to workout`);
        router.back();
      } else {
        throw new Error(response.message || 'Failed to add exercise');
      }
    } catch (error: any) {
      console.error('Add to Session Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Could not add exercise to session');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        title="Add Exercise"
        leftAction={{
          icon: <ArrowLeft size={24} color={theme.text} />,
          onPress: () => router.back(),
        }}
        theme={theme}
      />
      {/* FIX: Pass explicit IDs to ensure they survive filter navigation */}
      <ExerciseBrowser
        onSelectExercise={handleSelectExercise}
        theme={theme}
        planId={targetPlanId}
        sessionId={currentWorkoutId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
