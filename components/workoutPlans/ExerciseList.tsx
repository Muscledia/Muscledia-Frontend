// components/workoutPlans/ExerciseList.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, useColorScheme } from 'react-native';
import { Dumbbell } from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { PlannedExercise } from '@/types';
import PlannedExerciseCard from '../exercises/PlannedExerciseCard';

interface ExerciseListProps {
  exercises: PlannedExercise[];
  onExercisePress: (exercise: PlannedExercise) => void;
  loading?: boolean;
}

export default function ExerciseList({
                                       exercises,
                                       onExercisePress,
                                       loading = false,
                                     }: ExerciseListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  if (exercises.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Dumbbell size={48} color={theme.textMuted} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>
          No Exercises
        </Text>
        <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
          This workout plan doesn't have any exercises yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Exercises
        </Text>
        <View style={[styles.countBadge, { backgroundColor: theme.accent + '20' }]}>
          <Text style={[styles.countText, { color: theme.accent }]}>
            {exercises.length}
          </Text>
        </View>
      </View>

      <FlatList
        data={exercises}
        renderItem={({ item, index }) => (
          <PlannedExerciseCard
            exercise={item}
            index={index}
            onPress={() => onExercisePress(item)}
          />
        )}
        keyExtractor={(item, index) => item.exerciseTemplateId || `exercise-${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
});
