import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Target, Package, TrendingUp, Repeat, Timer } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { Exercise } from '@/types/api';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onPress: () => void;
}

export default function ExerciseCard({ exercise, index, onPress }: ExerciseCardProps) {
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
        {/* Exercise Number Badge */}
        <View style={[styles.numberBadge, { backgroundColor: theme.accent }]}>
          <Text style={[styles.numberText, { color: theme.cardText }]}>
            {index + 1}
          </Text>
        </View>

        <View style={styles.content}>
          {/* Exercise Image */}
          {exercise.imageUrl && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: exercise.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          )}

          <View style={styles.textContent}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                {exercise.name}
              </Text>
              <ChevronRight size={20} color={theme.accent} />
            </View>

            <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
              {exercise.description}
            </Text>

            {/* Muscle Groups */}
            {exercise.muscleGroups.length > 0 && (
              <View style={styles.infoRow}>
                <Target size={14} color={theme.accent} />
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Targets:
                </Text>
                <View style={styles.tagsContainer}>
                  {exercise.muscleGroups.slice(0, 2).map((muscle, idx) => (
                    <Text key={idx} style={[styles.infoText, { color: theme.accent }]}>
                      {muscle}
                      {idx < Math.min(exercise.muscleGroups.length - 1, 1) ? ', ' : ''}
                    </Text>
                  ))}
                  {exercise.muscleGroups.length > 2 && (
                    <Text style={[styles.infoText, { color: theme.textMuted }]}>
                      +{exercise.muscleGroups.length - 2}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Equipment */}
            {exercise.equipment.length > 0 && (
              <View style={styles.infoRow}>
                <Package size={14} color={theme.textMuted} />
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Equipment:
                </Text>
                <Text style={[styles.infoText, { color: theme.textMuted }]} numberOfLines={1}>
                  {exercise.equipment.join(', ')}
                </Text>
              </View>
            )}

            {/* Sets, Reps, Rest Time */}
            <View style={styles.metricsContainer}>
              {exercise.sets !== undefined && (
                <View style={[styles.metricBadge, { backgroundColor: theme.accent + '15' }]}>
                  <Repeat size={14} color={theme.accent} />
                  <Text style={[styles.metricText, { color: theme.accent }]}>
                    {exercise.sets} sets
                  </Text>
                </View>
              )}
              
              {exercise.reps !== undefined && (
                <View style={[styles.metricBadge, { backgroundColor: theme.accent + '15' }]}>
                  <TrendingUp size={14} color={theme.accent} />
                  <Text style={[styles.metricText, { color: theme.accent }]}>
                    {exercise.reps} reps
                  </Text>
                </View>
              )}
              
              {exercise.restTime !== undefined && (
                <View style={[styles.metricBadge, { backgroundColor: theme.textMuted + '15' }]}>
                  <Timer size={14} color={theme.textMuted} />
                  <Text style={[styles.metricText, { color: theme.textMuted }]}>
                    {exercise.restTime}s rest
                  </Text>
                </View>
              )}
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
    flexDirection: 'row',
    padding: 16,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1C1C1C',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 11,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
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

