import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Clock, TrendingUp, Dumbbell } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { WorkoutPlan } from '@/types/api';

interface WorkoutPlanCardProps {
  workoutPlan: WorkoutPlan;
  onPress: () => void;
}

export default function WorkoutPlanCard({ workoutPlan, onPress }: WorkoutPlanCardProps) {
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
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.wrapper}
    >
      <LinearGradient
        colors={[theme.surface, theme.surfaceLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
              {workoutPlan.name}
            </Text>
            <ChevronRight size={24} color={theme.accent} />
          </View>

          <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
            {workoutPlan.description}
          </Text>

          {/* Target Muscle Groups */}
          <View style={styles.muscleGroupsContainer}>
            {workoutPlan.targetMuscleGroups.slice(0, 3).map((muscle, index) => (
              <View
                key={index}
                style={[
                  styles.muscleTag,
                  { backgroundColor: theme.accent + '15' },
                ]}
              >
                <Text style={[styles.muscleText, { color: theme.accent }]}>
                  {muscle}
                </Text>
              </View>
            ))}
            {workoutPlan.targetMuscleGroups.length > 3 && (
              <Text style={[styles.moreText, { color: theme.textMuted }]}>
                +{workoutPlan.targetMuscleGroups.length - 3} more
              </Text>
            )}
          </View>

          {/* Metadata Footer */}
          <View style={styles.footer}>
            <View style={styles.metadataItem}>
              <TrendingUp
                size={14}
                color={getDifficultyColor(workoutPlan.difficulty)}
              />
              <Text
                style={[
                  styles.metadataText,
                  { color: getDifficultyColor(workoutPlan.difficulty) },
                ]}
              >
                {workoutPlan.difficulty}
              </Text>
            </View>

            <View style={styles.metadataItem}>
              <Clock size={14} color={theme.textMuted} />
              <Text style={[styles.metadataText, { color: theme.textMuted }]}>
                {workoutPlan.estimatedDuration} min
              </Text>
            </View>

            <View style={styles.metadataItem}>
              <Dumbbell size={14} color={theme.textMuted} />
              <Text style={[styles.metadataText, { color: theme.textMuted }]}>
                {workoutPlan.exerciseCount} exercises
              </Text>
            </View>
          </View>
        </View>

        {/* Golden accent stripe */}
        <View style={[styles.accentStripe, { backgroundColor: theme.accent }]} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  muscleTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  muscleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  moreText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    fontWeight: '500',
  },
  accentStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});

