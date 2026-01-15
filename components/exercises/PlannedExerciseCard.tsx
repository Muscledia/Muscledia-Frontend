// components/workoutPlans/PlannedExerciseCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Repeat, Timer, Hash, Activity } from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { PlannedExercise } from '@/types';

interface PlannedExerciseCardProps {
  exercise: PlannedExercise;
  index: number;
  onPress: () => void;
}

export default function PlannedExerciseCard({ exercise, index, onPress }: PlannedExerciseCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  const setCount = exercise.sets?.length || 0;
  const restTime = exercise.restSeconds || 0;

  // Get summary of set types (e.g., "3 sets, 1 warmup")
  const getSetSummary = () => {
    if (!exercise.sets || exercise.sets.length === 0) return 'No sets';

    const warmupCount = exercise.sets.filter(s => s.type === 'warmup').length;
    const normalCount = exercise.sets.filter(s => s.type === 'normal').length;

    const parts = [];
    if (normalCount > 0) parts.push(`${normalCount} set${normalCount !== 1 ? 's' : ''}`);
    if (warmupCount > 0) parts.push(`${warmupCount} warmup`);

    return parts.join(', ') || 'No sets';
  };

  // Get rep range or duration summary
  const getWorkSummary = () => {
    if (!exercise.sets || exercise.sets.length === 0) return null;

    const firstNormalSet = exercise.sets.find(s => s.type === 'normal');
    if (!firstNormalSet) return null;

    // Check for duration-based exercises
    if (firstNormalSet.durationSeconds) {
      return `${firstNormalSet.durationSeconds}s`;
    }

    // Check for rep range
    if (firstNormalSet.repRangeString) {
      return `${firstNormalSet.repRangeString} reps`;
    }

    // Check for fixed reps
    if (firstNormalSet.reps) {
      return `${firstNormalSet.reps} reps`;
    }

    // Check for weight
    if (firstNormalSet.weightKg) {
      return `${firstNormalSet.weightKg}kg`;
    }

    return firstNormalSet.effectiveReps || 'N/A';
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
        {/* Exercise Number Badge */}
        <View style={[styles.numberBadge, { backgroundColor: theme.accent }]}>
          <Text style={[styles.numberText, { color: theme.cardText }]}>
            {index + 1}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                {exercise.title || exercise.name}
              </Text>
              {exercise.notes && (
                <Text style={[styles.notes, { color: theme.textSecondary }]} numberOfLines={2}>
                  {exercise.notes}
                </Text>
              )}
            </View>
            <ChevronRight size={20} color={theme.accent} />
          </View>

          {/* Metrics */}
          <View style={styles.metricsContainer}>
            {/* Sets */}
            <View style={[styles.metricBadge, { backgroundColor: theme.accent + '15' }]}>
              <Repeat size={14} color={theme.accent} />
              <Text style={[styles.metricText, { color: theme.accent }]}>
                {getSetSummary()}
              </Text>
            </View>

            {/* Work summary (reps/duration) */}
            {getWorkSummary() && (
              <View style={[styles.metricBadge, { backgroundColor: theme.accent + '15' }]}>
                <Activity size={14} color={theme.accent} />
                <Text style={[styles.metricText, { color: theme.accent }]}>
                  {getWorkSummary()}
                </Text>
              </View>
            )}

            {/* Rest time */}
            {restTime > 0 && (
              <View style={[styles.metricBadge, { backgroundColor: theme.textMuted + '15' }]}>
                <Timer size={14} color={theme.textMuted} />
                <Text style={[styles.metricText, { color: theme.textMuted }]}>
                  {restTime}s rest
                </Text>
              </View>
            )}
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
  numberBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  numberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    paddingTop: 52, // Account for number badge
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notes: {
    fontSize: 12,
    lineHeight: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  metricText: {
    fontSize: 11,
    fontWeight: '600',
  },
  accentStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
