import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Target, Package, TrendingUp } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { Exercise } from '@/types';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
}

export default function ExerciseCard({ exercise, onPress }: ExerciseCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
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
          {/* Exercise Image */}
          <View style={styles.imageContainer}>
            {exercise.imageUrl ? (
              <Image
                source={{ uri: exercise.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: theme.background }]}>
                <Target size={24} color={theme.textMuted} />
              </View>
            )}
          </View>

          <View style={styles.textContent}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                {exercise.name}
              </Text>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) + '20' }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(exercise.difficulty) }]}>
                  {exercise.difficulty}
                </Text>
              </View>
            </View>

            <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
              {exercise.description}
            </Text>

            {/* Muscle Groups */}
            {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
              <View style={styles.infoRow}>
                <Target size={14} color={theme.accent} />
                <View style={styles.tagsContainer}>
                  {exercise.muscleGroups.slice(0, 3).map((muscle, idx) => (
                    <Text key={idx} style={[styles.infoText, { color: theme.accent }]}>
                      {muscle}
                      {idx < Math.min(exercise.muscleGroups.length - 1, 2) ? ', ' : ''}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Equipment */}
            {exercise.equipment && exercise.equipment.length > 0 && (
              <View style={styles.infoRow}>
                <Package size={14} color={theme.textMuted} />
                <Text style={[styles.infoText, { color: theme.textMuted }]} numberOfLines={1}>
                  {exercise.equipment.join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>
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
    flexDirection: 'row',
    padding: 12,
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
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
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
    marginBottom: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  infoText: {
    fontSize: 11,
  },
});

