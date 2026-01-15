// components/routines/WorkoutPlanCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { ChevronRight, Dumbbell, Clock } from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { WorkoutPlan } from '@/types';

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  index: number;
  onPress: () => void;
}

export default function WorkoutPlanCard({ plan, index, onPress }: WorkoutPlanCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  // Get comma-separated exercise names (like Hevy)
  const getExerciseNames = () => {
    if (!plan.exercises || plan.exercises.length === 0) {
      return 'No exercises';
    }

    // Take first 3-4 exercises and join with commas
    const exerciseNames = plan.exercises
      .slice(0, 4)
      .map(ex => ex.title)
      .join(', ');

    if (plan.exercises.length > 4) {
      return `${exerciseNames}, +${plan.exercises.length - 4} more`;
    }

    return exerciseNames;
  };

  const exerciseCount = plan.exercises?.length || 0;
  const duration = plan.estimatedDurationMinutes || 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.surface }]}
      activeOpacity={0.7}
    >
      {/* Day indicator */}
      <View style={[styles.dayBadge, { backgroundColor: theme.accent + '20' }]}>
        <Text style={[styles.dayText, { color: theme.accent }]}>
          Day {index + 1}
        </Text>
      </View>

      {/* Plan title */}
      <Text style={[styles.planTitle, { color: theme.text }]}>
        {plan.title}
      </Text>

      {/* Exercise names - Hevy style */}
      <Text style={[styles.exerciseNames, { color: theme.textSecondary }]} numberOfLines={2}>
        {getExerciseNames()}
      </Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Dumbbell size={14} color={theme.textMuted} />
          <Text style={[styles.statText, { color: theme.textMuted }]}>
            {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
          </Text>
        </View>

        {duration > 0 && (
          <View style={styles.stat}>
            <Clock size={14} color={theme.textMuted} />
            <Text style={[styles.statText, { color: theme.textMuted }]}>
              ~{duration} min
            </Text>
          </View>
        )}
      </View>

      {/* Chevron */}
      <View style={styles.chevronContainer}>
        <ChevronRight size={20} color={theme.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  dayBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingRight: 32,
  },
  exerciseNames: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
  },
  chevronContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});
