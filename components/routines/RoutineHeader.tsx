import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RoutineFolder } from '@/types/api';
import { Colors, getThemeColors } from '@/constants/Colors';
import { TrendingUp, Clock, User } from 'lucide-react-native';

interface RoutineHeaderProps {
  routineFolder: RoutineFolder;
}

export const RoutineHeader: React.FC<RoutineHeaderProps> = ({ routineFolder }) => {
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
    <View style={styles.container}>
      {/* Hero Image */}
      {routineFolder.imageUrl ? (
        <Image
          source={{ uri: routineFolder.imageUrl }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={[theme.accent, theme.accentSecondary]}
          locations={[0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroImagePlaceholder}
        >
          <TrendingUp size={64} color={theme.cardText} />
        </LinearGradient>
      )}

      {/* Content */}
      <View style={[styles.content, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          {routineFolder.name}
        </Text>
        
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {routineFolder.description}
        </Text>

        {/* Metadata Row */}
        <View style={styles.metadataRow}>
          {/* Difficulty Badge */}
          <View
            style={[
              styles.badge,
              { backgroundColor: getDifficultyColor(routineFolder.difficulty) + '20' },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: getDifficultyColor(routineFolder.difficulty) },
              ]}
            >
              {routineFolder.difficulty}
            </Text>
          </View>

          {/* Duration */}
          {routineFolder.duration && (
            <View style={[styles.metadataItem, { backgroundColor: theme.surfaceLight }]}>
              <Clock size={14} color={theme.textMuted} />
              <Text style={[styles.metadataText, { color: theme.textMuted }]}>
                {routineFolder.duration}
              </Text>
            </View>
          )}

          {/* Created By */}
          <View style={[styles.metadataItem, { backgroundColor: theme.surfaceLight }]}>
            <User size={14} color={theme.textMuted} />
            <Text style={[styles.metadataText, { color: theme.textMuted }]}>
              {routineFolder.createdBy}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#1C1C1C',
  },
  heroImagePlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  metadataText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

