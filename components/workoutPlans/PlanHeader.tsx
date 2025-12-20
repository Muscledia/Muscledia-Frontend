// components/workoutPlans/PlanHeader.tsx

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { getThemeColors } from '@/constants/Colors';
import { WorkoutPlanDetail, WorkoutPlan } from '@/types';
import { Target, Dumbbell, Clock } from 'lucide-react-native';

interface PlanHeaderProps {
  plan: WorkoutPlanDetail | WorkoutPlan;
}

export default function PlanHeader({ plan }: PlanHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  // Get difficulty color with null safety
  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return theme.textMuted;

    const level = difficulty.toLowerCase();
    switch (level) {
      case 'beginner':
        return '#4CAF50'; // Green
      case 'intermediate':
        return '#FF9800'; // Orange
      case 'advanced':
        return '#F44336'; // Red
      default:
        return theme.textMuted;
    }
  };

  const exerciseCount = plan.exercises?.length || 0;
  const duration = plan.estimatedDurationMinutes || plan.estimatedDuration || 0;

  return (
    <View style={styles.header}>
      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>
        {plan.title || plan.name}
      </Text>

      {/* Description */}
      {plan.description && (
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {plan.description}
        </Text>
      )}

      {/* Metadata badges */}
      <View style={styles.badgeContainer}>
        {/* Exercise count */}
        <View style={[styles.badge, { backgroundColor: theme.accent + '20' }]}>
          <Dumbbell size={14} color={theme.accent} />
          <Text style={[styles.badgeText, { color: theme.accent }]}>
            {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
          </Text>
        </View>

        {/* Duration */}
        {duration > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.textMuted + '20' }]}>
            <Clock size={14} color={theme.textMuted} />
            <Text style={[styles.badgeText, { color: theme.textMuted }]}>
              ~{duration} min
            </Text>
          </View>
        )}

        {/* Difficulty (only show if available) */}
        {plan.difficulty && (
          <View style={[styles.badge, { backgroundColor: getDifficultyColor(plan.difficulty) + '20' }]}>
            <Target size={14} color={getDifficultyColor(plan.difficulty)} />
            <Text style={[styles.badgeText, { color: getDifficultyColor(plan.difficulty) }]}>
              {plan.difficulty}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
