// app/workout-session/add-exercise.tsx - SIMPLIFIED
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { WorkoutService } from '@/services';
import { useHaptics } from '@/hooks/useHaptics';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ExerciseBrowser } from '@/components/exercises/ExerciseBrowser';
import { Alert, useColorScheme } from 'react-native';

export default function AddExerciseDuringWorkoutScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

  const handleAddExercise = async (exercise: any) => {
    await impact('medium');

    const exerciseData = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      notes: '',
    };

    const response = await WorkoutService.addExerciseToWorkout(workoutId, exerciseData);

    if (response.success) {
      await impact('success');
      Alert.alert('Success', 'Exercise added to workout!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      await impact('error');
      Alert.alert('Error', 'Failed to add exercise');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScreenHeader
        title="Add Exercise"
        leftAction={{
          icon: <ArrowLeft size={24} color={theme.text} />,
          onPress: () => router.back()
        }}
        theme={theme}
      />
      <ExerciseBrowser onSelectExercise={handleAddExercise} />
    </View>
  );
}
