import React from 'react';
import { View, Text, StyleSheet, Image, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, TrendingUp, User } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { RoutineFolder } from '@/types';

interface RoutineHeaderProps {
  routine: RoutineFolder;
}

export default function RoutineHeader({ routine }: RoutineHeaderProps) {
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
      {routine.imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: routine.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', theme.background]}
            style={styles.imageGradient}
          />
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{routine.name}</Text>

        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {routine.description}
        </Text>

        <View style={styles.metadataContainer}>
          <View style={styles.metadataRow}>
            <View
              style={[
                styles.badge,
                { backgroundColor: getDifficultyColor(routine.difficulty) + '20' },
              ]}
            >
              <TrendingUp
                size={16}
                color={getDifficultyColor(routine.difficulty)}
              />
              <Text
                style={[
                  styles.badgeText,
                  { color: getDifficultyColor(routine.difficulty) },
                ]}
              >
                {routine.difficulty}
              </Text>
            </View>

            <View
              style={[
                styles.badge,
                { backgroundColor: theme.accent + '20' },
              ]}
            >
              <Clock size={16} color={theme.accent} />
              <Text style={[styles.badgeText, { color: theme.accent }]}>
                {routine.duration}
              </Text>
            </View>
          </View>

        </View>
      </View>

      {/* Golden accent line */}
      <View style={[styles.accentLine, { backgroundColor: theme.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1C1C1C',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
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
  metadataContainer: {
    gap: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
    fontSize: 13,
    fontWeight: '600',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  authorText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  accentLine: {
    height: 4,
    width: '100%',
  },
});

