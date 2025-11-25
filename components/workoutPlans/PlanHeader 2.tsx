import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Clock, TrendingUp, Dumbbell, Target } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { WorkoutPlanDetail } from '@/types/api';

interface PlanHeaderProps {
  plan: WorkoutPlanDetail;
}

export default function PlanHeader({ plan }: PlanHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FFA500';
      case 'advanced':
        return '#F44336';
      default:
        return theme.textMuted;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{plan.name}</Text>
        
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {plan.description}
        </Text>

        {/* Target Muscle Groups */}
        {plan.targetMuscleGroups.length > 0 && (
          <View style={styles.muscleGroupsContainer}>
            <Target size={16} color={theme.accent} />
            <Text style={[styles.muscleGroupsLabel, { color: theme.textSecondary }]}>
              Target Muscles:
            </Text>
            <View style={styles.muscleTagsContainer}>
              {plan.targetMuscleGroups.map((muscle, index) => (
                <View
                  key={index}
                  style={[
                    styles.muscleTag,
                    { backgroundColor: theme.accent + '20' },
                  ]}
                >
                  <Text style={[styles.muscleTagText, { color: theme.accent }]}>
                    {muscle}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Metadata Row */}
        <View style={styles.metadataContainer}>
          <View
            style={[
              styles.metadataBadge,
              { backgroundColor: getDifficultyColor(plan.difficulty) + '20' },
            ]}
          >
            <TrendingUp
              size={16}
              color={getDifficultyColor(plan.difficulty)}
            />
            <Text
              style={[
                styles.metadataText,
                { color: getDifficultyColor(plan.difficulty) },
              ]}
            >
              {plan.difficulty}
            </Text>
          </View>

          <View
            style={[
              styles.metadataBadge,
              { backgroundColor: theme.accent + '20' },
            ]}
          >
            <Clock size={16} color={theme.accent} />
            <Text style={[styles.metadataText, { color: theme.accent }]}>
              {plan.estimatedDuration} min
            </Text>
          </View>

          <View
            style={[
              styles.metadataBadge,
              { backgroundColor: theme.textMuted + '20' },
            ]}
          >
            <Dumbbell size={16} color={theme.textMuted} />
            <Text style={[styles.metadataText, { color: theme.textMuted }]}>
              {plan.exerciseCount} exercises
            </Text>
          </View>
        </View>

        {/* Instructions */}
        {plan.instructions && (
          <View style={[styles.instructionsContainer, { backgroundColor: theme.surface }]}>
            <Text style={[styles.instructionsTitle, { color: theme.text }]}>
              Instructions
            </Text>
            <Text style={[styles.instructionsText, { color: theme.textSecondary }]}>
              {plan.instructions}
            </Text>
          </View>
        )}
      </View>

      {/* Golden accent line */}
      <View style={[styles.accentLine, { backgroundColor: theme.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  muscleGroupsLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  muscleTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  muscleTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  muscleTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metadataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  metadataText: {
    fontSize: 13,
    fontWeight: '600',
  },
  instructionsContainer: {
    padding: 12,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  instructionsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  accentLine: {
    height: 4,
    width: '100%',
  },
});

