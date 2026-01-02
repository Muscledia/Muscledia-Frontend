import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Challenge } from '@/types';

interface ChallengeCardProps {
  challenge: Challenge;
  onStart: (challengeId: string) => void;
  isLoading?: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  challenge, 
  onStart, 
  isLoading = false 
}) => {
  const objectiveIcon = getObjectiveIcon(challenge.objectiveType);
  const difficultyStyle = getDifficultyStyle(challenge.difficultyLevel);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>{objectiveIcon}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{challenge.name}</Text>
          <Text style={styles.description}>{challenge.description}</Text>
        </View>
        <View style={[styles.difficultyBadge, difficultyStyle]}>
          <Text style={styles.difficultyText}>
            {challenge.difficultyLevel}
          </Text>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '0%' }]} />
        </View>
        <Text style={styles.progressText}>
          0/{challenge.targetValue} {challenge.progressUnit}
        </Text>
      </View>

      {/* Reward Section */}
      <View style={styles.rewardSection}>
        <Text style={styles.rewardText}>
          🏆 {challenge.rewardPoints} XP
        </Text>
      </View>

      {/* Start Button */}
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => onStart(challenge.id)}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.startButtonText}>START CHALLENGE</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const getObjectiveIcon = (type: string): string => {
  const icons: { [key: string]: string } = {
    EXERCISES: '🏋️',
    REPS: '🔢',
    DURATION: '⏱️',
    TIME_BASED: '📅',
    VOLUME_BASED: '💪',
    CALORIES: '🔥',
    PERSONAL_RECORDS: '🏆',
    ACHIEVEMENT_BASED: '⭐',
  };
  return icons[type] || '🎯';
};

const getDifficultyStyle = (difficulty: string) => {
  const styles: { [key: string]: object } = {
    BEGINNER: { backgroundColor: '#10b981' },
    INTERMEDIATE: { backgroundColor: '#f59e0b' },
    ADVANCED: { backgroundColor: '#ef4444' },
    ELITE: { backgroundColor: '#8b5cf6' },
  };
  return styles[difficulty] || { backgroundColor: '#6b7280' };
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 300,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 18,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
  },
  progressText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'right',
    fontWeight: '600',
  },
  rewardSection: {
    marginBottom: 12,
  },
  rewardText: {
    fontSize: 14,
    color: '#fbbf24',
    fontWeight: '600',
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

export default ChallengeCard;
