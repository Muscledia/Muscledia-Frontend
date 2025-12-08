// app/exercises/browse.tsx - FIXED FOR BACKEND PLANNEDSET STRUCTURE

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

// Convert instructions array to formatted string
const formatInstructions = (instructions?: string | string[]): string => {
  if (!instructions) return '';
  if (typeof instructions === 'string') return instructions;
  if (Array.isArray(instructions)) {
    return instructions.map((step, index) => `${index + 1}. ${step}`).join('\n\n');
  }
  return '';
};

export default function ExerciseBrowserScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ planId?: string; sessionId?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

  // Extract IDs from params
  const targetPlanId = params.planId;
  const currentWorkoutId = params.sessionId;

  const handleSelectExercise = async (exercise: Exercise) => {
    await impact('medium');

    if (params.planId) {
      await addExerciseToPlan(exercise);
    } else if (params.sessionId) {
      await addExerciseToSession(exercise);
    } else {
      Alert.alert('Error', 'No workout plan or session specified');
    }
  };

  const addExerciseToPlan = async (exercise: Exercise) => {
    if (!targetPlanId) {
      Alert.alert('Error', 'No workout plan selected');
      return;
    }

    try {
      await impact('medium');

      // Helper function to format instructions
      const formatInstructions = (instructions?: string[]): string => {
        if (!instructions || instructions.length === 0) return '';
        return instructions.join('\n');
      };

      // Helper function to map difficulty
      const mapDifficulty = (difficulty?: string): string => {
        if (!difficulty) return 'INTERMEDIATE';
        const upper = difficulty.toUpperCase();
        return ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(upper)
          ? upper
          : 'INTERMEDIATE';
      };

      // Helper function to map category
      const mapCategory = (category?: string): string => {
        if (!category) return 'STRENGTH';
        const upper = category.toUpperCase();
        return ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'SPORTS', 'OTHER'].includes(upper)
          ? upper
          : 'STRENGTH';
      };

      // Build complete payload with ALL metadata
      const exerciseRequest = {
        // Required fields (note: different from session!)
        exerciseTemplateId: exercise.externalId || exercise.id,
        title: exercise.name,

        // Text content
        notes: exercise.description || '',
        instructions: formatInstructions(exercise.instructions),
        description: exercise.description || '',

        // Metadata fields for workout plan display and tracking
        bodyPart: exercise.bodyPart || null,
        equipment: exercise.equipment || null,
        targetMuscle: exercise.targetMuscle || null,
        secondaryMuscles: exercise.secondaryMuscles || [],
        difficulty: mapDifficulty(exercise.difficulty),
        category: mapCategory(exercise.category),

        // Configuration
        restSeconds: 120,

        // Default sets
        sets: [{
          type: 'NORMAL',
          reps: null,
          weightKg: null,
          durationSeconds: null,
          distanceMeters: null,
          repRangeStart: null,
          repRangeEnd: null,
          restSeconds: 90,
        }],
      };

      console.log('Adding exercise to plan:', targetPlanId);
      console.log('Exercise data:', exerciseRequest);

      const response = await WorkoutPlanService.addExerciseToWorkoutPlan(
        targetPlanId,
        exerciseRequest
      );

      if (response.success) {
        await impact('heavy');
        Alert.alert('Success', `Added ${exercise.name} to workout plan`);
        router.back();
      }
    } catch (error: any) {
      console.error('Error adding exercise to plan:', error.response?.data || error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add exercise to plan'
      );
    }
  };

  const addExerciseToSession = async (exercise: Exercise) => {
    if (!currentWorkoutId) {
      Alert.alert('Error', 'No active workout session');
      return;
    }

    try {
      await impact('medium');

      // Map exercise data with ALL required fields
      const exerciseData = {
        // Required fields (different from workout plan!)
        exerciseId: exercise.externalId || exercise.id,
        exerciseName: exercise.name,

        // Optional fields
        notes: exercise.description || '',

        // Metadata fields for display and tracking
        exerciseCategory: mapCategory(exercise.category),
        primaryMuscleGroup: exercise.targetMuscle || null,
        secondaryMuscleGroups: exercise.secondaryMuscles || [],
        equipment: exercise.equipment || null,

        // Additional denormalized fields
        bodyPart: exercise.bodyPart || null,
        targetMuscle: exercise.targetMuscle || null,
        difficulty: mapDifficulty(exercise.difficulty),
        category: mapCategory(exercise.category),
        description: exercise.description || null,

        // Default sets
        sets: [
          {
            setNumber: 1,
            setType: 'NORMAL',
            weightKg: null,
            reps: null,
            durationSeconds: null,
            distanceMeters: null,
            restSeconds: null,
            rpe: null,
            notes: null,
            completed: false,
          },
          {
            setNumber: 2,
            setType: 'NORMAL',
            weightKg: null,
            reps: null,
            durationSeconds: null,
            distanceMeters: null,
            restSeconds: null,
            rpe: null,
            notes: null,
            completed: false,
          },
          {
            setNumber: 3,
            setType: 'NORMAL',
            weightKg: null,
            reps: null,
            durationSeconds: null,
            distanceMeters: null,
            restSeconds: null,
            rpe: null,
            notes: null,
            completed: false,
          },
        ],
      };

      console.log('Adding exercise to session:', exerciseData);

      const response = await WorkoutService.addExerciseToSession(
        currentWorkoutId,
        exerciseData
      );

      if (response.success) {
        await impact('heavy');
        Alert.alert('Success', `Added ${exercise.name} to workout`);
        router.back();
      }
    } catch (error: any) {
      console.error('Error adding exercise to session:', error.response?.data || error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add exercise'
      );
    }
  };

  // Helper functions (add these if missing)
  const mapDifficulty = (difficulty?: string): string => {
    if (!difficulty) return 'INTERMEDIATE';
    const upper = difficulty.toUpperCase();
    if (['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(upper)) {
      return upper;
    }
    return 'INTERMEDIATE';
  };

  const mapCategory = (category?: string): string => {
    if (!category) return 'STRENGTH';
    const upper = category.toUpperCase();
    if (['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'SPORTS', 'OTHER'].includes(upper)) {
      return upper;
    }
    return 'STRENGTH';
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
      <ExerciseBrowser onSelectExercise={handleSelectExercise} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
