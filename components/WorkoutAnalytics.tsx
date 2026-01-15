// components/WorkoutAnalytics.tsx
// Workout Completion Analytics Display Component

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, X, Trophy, Flame, TrendingUp, Star, Dumbbell } from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { WorkoutSession, WorkoutSet } from '@/types/workout.types';

interface WorkoutAnalyticsProps {
  visible: boolean;
  workout: WorkoutSession | null;
  onClose: () => void;
}

// PR Type Icons Mapping
const PR_ICONS: Record<string, { icon: React.ComponentType<any>; emoji: string; label: string }> = {
  MAX_WEIGHT: { icon: Trophy, emoji: '💪', label: 'MAX WEIGHT' },
  MAX_REPS: { icon: Flame, emoji: '🔥', label: 'MAX REPS' },
  MAX_VOLUME: { icon: TrendingUp, emoji: '📊', label: 'MAX VOLUME' },
  ESTIMATED_1RM: { icon: Star, emoji: '⭐', label: 'ESTIMATED 1RM' },
};

export default function WorkoutAnalytics({
  visible,
  workout,
  onClose,
}: WorkoutAnalyticsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  if (!workout) return null;

  const { metrics, exercises, durationMinutes } = workout;
  const prCount = metrics.personalRecordsAchieved || 0;

  // Collect all PRs from sets
  const allPRs: Array<{ type: string; exerciseName: string; setNumber: number; weightKg: number | null; reps: number | null }> = [];
  exercises.forEach((exercise) => {
    exercise.sets.forEach((set) => {
      if (set.personalRecords && set.personalRecords.length > 0) {
        set.personalRecords.forEach((prType) => {
          allPRs.push({
            type: prType,
            exerciseName: exercise.exerciseName,
            setNumber: set.setNumber,
            weightKg: set.weightKg,
            reps: set.reps,
          });
        });
      }
    });
  });

  // Format duration
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '0 minutes';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  };

  // Format volume
  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k kg`;
    }
    return `${volume.toLocaleString()} kg`;
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.surface,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={[styles.title, { color: theme.text }]}>
                  Workout Complete! 🎉
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeButton, { backgroundColor: theme.background }]}
              >
                <X size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Core Metrics */}
            <View style={[styles.metricsSection, { backgroundColor: theme.background }]}>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Duration</Text>
                <Text style={[styles.metricValue, { color: theme.accent }]}>
                  {formatDuration(durationMinutes)}
                </Text>
              </View>
              
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Total Volume</Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {formatVolume(metrics.totalVolume)}
                </Text>
              </View>
              
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Total Sets</Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {metrics.totalSets}
                </Text>
              </View>
              
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Total Reps</Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {metrics.totalReps}
                </Text>
              </View>
              
              {metrics.caloriesBurned > 0 && (
                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Calories Burned</Text>
                  <Text style={[styles.metricValue, { color: theme.text }]}>
                    {metrics.caloriesBurned}
                  </Text>
                </View>
              )}
            </View>

            {/* Personal Records Section */}
            {prCount > 0 && (
              <View style={[styles.prSection, { backgroundColor: theme.background }]}>
                <View style={styles.prHeader}>
                  <Trophy size={24} color="#FFD700" />
                  <Text style={[styles.prTitle, { color: theme.text }]}>
                    {prCount} Personal Record{prCount !== 1 ? 's' : ''}!
                  </Text>
                </View>
                
                <View style={styles.prList}>
                  {allPRs.map((pr, index) => {
                    const prConfig = PR_ICONS[pr.type] || { icon: Award, emoji: '🏆', label: pr.type };
                    const IconComponent = prConfig.icon;
                    
                    return (
                      <View
                        key={index}
                        style={[styles.prItem, { backgroundColor: '#FFD700' + '20', borderColor: '#FFD700' + '40' }]}
                      >
                        <View style={styles.prItemLeft}>
                          <View style={[styles.prIconContainer, { backgroundColor: '#FFD700' }]}>
                            <IconComponent size={16} color="#000" />
                          </View>
                          <View style={styles.prItemInfo}>
                            <Text style={[styles.prType, { color: theme.text }]}>
                              {prConfig.label}
                            </Text>
                            <Text style={[styles.prExercise, { color: theme.textMuted }]}>
                              {pr.exerciseName} - Set {pr.setNumber}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.prItemRight}>
                          {pr.weightKg && (
                            <Text style={[styles.prValue, { color: theme.text }]}>
                              {pr.weightKg}kg
                            </Text>
                          )}
                          {pr.reps && (
                            <Text style={[styles.prValue, { color: theme.text }]}>
                              ×{pr.reps}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Muscle Groups Section */}
            {metrics.workedMuscleGroups && metrics.workedMuscleGroups.length > 0 && (
              <View style={[styles.muscleSection, { backgroundColor: theme.background }]}>
                <View style={styles.muscleHeader}>
                  <Dumbbell size={20} color={theme.accent} />
                  <Text style={[styles.muscleTitle, { color: theme.text }]}>
                    Muscles Worked
                  </Text>
                </View>
                <View style={styles.muscleTags}>
                  {metrics.workedMuscleGroups.map((muscle, index) => (
                    <View
                      key={index}
                      style={[styles.muscleTag, { backgroundColor: theme.accent + '20' }]}
                    >
                      <Text style={[styles.muscleTagText, { color: theme.accent }]}>
                        {muscle}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Action Button */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.accent }]}
                onPress={onClose}
              >
                <Text style={[styles.primaryButtonText, { color: theme.cardText }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  prSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  prTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  prList: {
    gap: 12,
  },
  prItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  prItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  prIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prItemInfo: {
    flex: 1,
  },
  prType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  prExercise: {
    fontSize: 12,
  },
  prItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  muscleSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  muscleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  muscleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  muscleTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
