import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WorkoutPlan } from '@/types/api';
import { Colors, getThemeColors } from '@/constants/Colors';
import { Dumbbell, Clock, Target } from 'lucide-react-native';

interface WorkoutPlanCardProps {
  workoutPlan: WorkoutPlan;
  onPress: (workoutPlan: WorkoutPlan) => void;
}

export const WorkoutPlanCard: React.FC<WorkoutPlanCardProps> = ({
  workoutPlan,
  onPress,
}) => {
  const theme = getThemeColors(true); // Always use dark mode

  // Get difficulty color
  const getDifficultyColor = (difficulty: string): string => {
    const lower = difficulty.toLowerCase();
    if (lower.includes('beginner') || lower.includes('easy')) return Colors.status.success.main;
    if (lower.includes('intermediate') || lower.includes('medium')) return Colors.status.warning.main;
    if (lower.includes('advanced') || lower.includes('hard')) return Colors.status.error.main;
    return theme.accent;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface }]}
      onPress={() => onPress(workoutPlan)}
      activeOpacity={0.9}
    >
      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
        {workoutPlan.name}
      </Text>

      {/* Description */}
      <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
        {workoutPlan.description}
      </Text>

      {/* Target Muscle Groups */}
      {workoutPlan.targetMuscleGroups && workoutPlan.targetMuscleGroups.length > 0 && (
        <View style={styles.muscleGroupsContainer}>
          <Target size={14} color={theme.accent} />
          <Text style={[styles.muscleGroupsText, { color: theme.textMuted }]} numberOfLines={1}>
            {workoutPlan.targetMuscleGroups.join(', ')}
          </Text>
        </View>
      )}

      {/* Bottom Row - Stats */}
      <View style={styles.statsRow}>
        {/* Duration */}
        <View style={[styles.stat, { backgroundColor: theme.surfaceLight }]}>
          <Clock size={12} color={theme.textMuted} />
          <Text style={[styles.statText, { color: theme.textMuted }]}>
            {workoutPlan.estimatedDuration} min
          </Text>
        </View>

        {/* Exercise Count */}
        <View style={[styles.stat, { backgroundColor: theme.surfaceLight }]}>
          <Dumbbell size={12} color={theme.textMuted} />
          <Text style={[styles.statText, { color: theme.textMuted }]}>
            {workoutPlan.exerciseCount} {workoutPlan.exerciseCount === 1 ? 'exercise' : 'exercises'}
          </Text>
        </View>

        {/* Difficulty */}
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(workoutPlan.difficulty) + '20' },
          ]}
        >
          <Text
            style={[
              styles.difficultyText,
              { color: getDifficultyColor(workoutPlan.difficulty) },
            ]}
          >
            {workoutPlan.difficulty}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  muscleGroupsText: {
    fontSize: 13,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

