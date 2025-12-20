// app/routine-detail/[id]/index.tsx - UPDATED: Added Routine Title Display

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Dumbbell,
  Clock,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { RoutineService } from '@/services';
import { RoutineFolder, WorkoutPlan, PlannedExercise } from '@/types';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useHaptics } from '@/hooks/useHaptics';

export default function RoutineDetailScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { impact } = useHaptics();

  const [routineFolder, setRoutineFolder] = useState<RoutineFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());

  const isPublic = params.isPublic === 'true';
  const routineId = params.id as string;

  useEffect(() => {
    loadRoutineDetails();
  }, [routineId, isPublic]);

  const loadRoutineDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (params.routineData) {
        const parsedRoutine = JSON.parse(params.routineData as string) as RoutineFolder;

        if (!parsedRoutine.workoutPlans || parsedRoutine.workoutPlans.length === 0) {
          // Fetch from API if workout plans are empty
        } else {
          setRoutineFolder(parsedRoutine);
          setLoading(false);
          return;
        }
      }

      let response;
      if (isPublic) {
        response = await RoutineService.getPublicRoutineFolderById(routineId);
      } else {
        response = await RoutineService.getPersonalRoutineFolderById(routineId);
      }

      if (response.success && response.data) {
        setRoutineFolder(response.data);
      } else {
        setError(response.message || 'Failed to load routine details');
      }
    } catch (err) {
      console.error('Error loading routine:', err);
      setError('Failed to load routine details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoutine = async () => {
    if (!routineFolder) return;

    try {
      await impact('medium');
      setSaving(true);

      const response = await RoutineService.savePublicRoutine(routineFolder.id);

      if (response.success) {
        await impact('success');
        setIsSaved(true);
        Alert.alert(
          'Success',
          'Routine saved to your collection!',
          [
            {
              text: 'View My Routines',
              onPress: () => router.push('/(tabs)'),
            },
            { text: 'OK' },
          ]
        );
      } else {
        await impact('error');
        Alert.alert('Error', response.message || 'Failed to save routine');
      }
    } catch (err) {
      console.error('Error saving routine:', err);
      await impact('error');
      Alert.alert('Error', 'Failed to save routine');
    } finally {
      setSaving(false);
    }
  };

  const toggleWorkoutPlan = async (planId: string) => {
    await impact('light');
    setExpandedPlans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toUpperCase()) {
      case 'BEGINNER':
        return '#4CAF50';
      case 'INTERMEDIATE':
        return '#FF9800';
      case 'ADVANCED':
        return '#F44336';
      default:
        return theme.textMuted;
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    const color = getDifficultyColor(difficulty);
    return <TrendingUp size={16} color={color} />;
  };

  const getEquipmentIcon = (equipment?: string) => {
    return <Dumbbell size={16} color={theme.textMuted} />;
  };

  const renderExerciseCard = (exercise: PlannedExercise, index: number) => {
    // Format set information
    const formatSetInfo = () => {
      if (!exercise.sets || exercise.sets.length === 0) return 'No sets';

      const firstSet = exercise.sets[0];
      const setCount = exercise.sets.length;

      if (firstSet.repRangeString) {
        return `${setCount} ${setCount === 1 ? 'set' : 'sets'} • ${firstSet.repRangeString} reps`;
      } else if (firstSet.reps) {
        return `${setCount} ${setCount === 1 ? 'set' : 'sets'} • ${firstSet.reps} reps`;
      } else if (firstSet.durationSeconds) {
        return `${setCount} ${setCount === 1 ? 'set' : 'sets'} • ${firstSet.durationSeconds}s`;
      }

      return `${setCount} ${setCount === 1 ? 'set' : 'sets'}`;
    };

    return (
      <View
        key={exercise.exerciseTemplateId || index}
        style={[styles.exerciseCard, { backgroundColor: theme.background }]}
      >
        <View style={styles.exerciseContent}>
          {/* Exercise Icon/Image */}
          <View style={[styles.exerciseIcon, { backgroundColor: theme.surface }]}>
            <Dumbbell size={24} color={theme.accent} />
          </View>

          {/* Exercise Info */}
          <View style={styles.exerciseDetails}>
            <Text style={[styles.exerciseTitle, { color: theme.accent }]}>
              {exercise.title || exercise.name}
            </Text>
            <Text style={[styles.exerciseSetInfo, { color: theme.textMuted }]}>
              {formatSetInfo()}
            </Text>
          </View>
        </View>

        {/* Exercise Notes */}
        {exercise.notes && (
          <Text style={[styles.exerciseDescription, { color: theme.textSecondary }]}>
            {exercise.notes}
          </Text>
        )}
      </View>
    );
  };

  const renderWorkoutPlan = (plan: WorkoutPlan, index: number) => {
    const isExpanded = expandedPlans.has(plan.id);
    const exerciseCount = plan.exercises?.length || 0;

    return (
      <View key={plan.id} style={styles.workoutPlanSection}>
        {/* Workout Plan Header */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleWorkoutPlan(plan.id)}
          style={styles.workoutPlanHeader}
        >
          <View style={styles.planHeaderContent}>
            <Text style={[styles.planTitle, { color: theme.text }]}>
              {plan.title || plan.name}
            </Text>
            {plan.description && plan.description !== 'Imported from Hevy' && (
              <Text style={[styles.planDescription, { color: theme.textSecondary }]}>
                {plan.description}
              </Text>
            )}
          </View>
          {isExpanded ? (
            <ChevronUp size={24} color={theme.textMuted} />
          ) : (
            <ChevronDown size={24} color={theme.textMuted} />
          )}
        </TouchableOpacity>

        {/* Exercise List */}
        {isExpanded && (
          <View style={styles.exerciseList}>
            {exerciseCount === 0 ? (
              <View style={styles.emptyExercises}>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  No exercises in this workout
                </Text>
              </View>
            ) : (
              plan.exercises.map((exercise, idx) => renderExerciseCard(exercise, idx))
            )}
          </View>
        )}

        {/* Divider */}
        {index < (routineFolder?.workoutPlans?.length || 0) - 1 && (
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
        )}
      </View>
    );
  };

  if (loading) return <LoadingScreen message="Loading routine..." theme={theme} />;

  if (error || !routineFolder) {
    return (
      <ErrorState
        error={error || 'Routine not found'}
        onRetry={loadRoutineDetails}
        theme={theme}
      />
    );
  }

  const workoutPlans = routineFolder.workoutPlans || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Routine Details</Text>
        <TouchableOpacity onPress={() => {}} style={styles.bookmarkButton}>
          <Bookmark size={24} color={theme.accent} onPress={handleSaveRoutine} disabled={saving || isSaved} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Creator Badge */}
        <View style={styles.creatorBadge}>
          <Bookmark size={16} color={theme.textMuted} />
          <Text style={[styles.creatorText, { color: theme.textMuted }]}>
            Created by {routineFolder.createdBy || 'Hevy'}
          </Text>
        </View>

        {/* Routine Title - NEW ADDITION */}
        <Text style={[styles.routineName, { color: theme.text }]}>
          {routineFolder.title}
        </Text>

        {/* Save Button */}
        {isPublic && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSaveRoutine}
            disabled={saving || isSaved}
            style={styles.saveButtonContainer}
          >
            <LinearGradient
              colors={
                isSaved
                  ? ['#4CAF50', '#45a049']
                  : [theme.accent, theme.accentSecondary]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              {isSaved ? (
                <BookmarkCheck size={20} color={theme.cardText} />
              ) : (
                <Bookmark size={20} color={theme.cardText} />
              )}
              <Text style={[styles.saveButtonText, { color: theme.cardText }]}>
                {saving
                  ? 'Saving...'
                  : isSaved
                    ? 'Saved to My Routines'
                    : 'Save to My Routines'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Program Description */}
        {routineFolder.description && routineFolder.description !== 'No description available' && (
          <Text style={[styles.programDescription, { color: theme.text }]}>
            {routineFolder.description}
          </Text>
        )}

        {/* Program Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            {getDifficultyIcon(routineFolder.difficultyLevel)}
            <Text style={[styles.statLabel, { color: theme.text }]}>
              {routineFolder.difficultyLevel || 'Beginner'}
            </Text>
          </View>
          <View style={styles.statBox}>
            {getEquipmentIcon(routineFolder.equipmentType)}
            <Text style={[styles.statLabel, { color: theme.text }]}>
              {routineFolder.equipmentType || 'Gym'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Target size={16} color={theme.textMuted} />
            <Text style={[styles.statLabel, { color: theme.text }]}>
              {routineFolder.workoutSplit?.replace('_', ' ') || 'Full Body'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Dumbbell size={16} color={theme.textMuted} />
            <Text style={[styles.statLabel, { color: theme.text }]}>
              {workoutPlans.length} Routines
            </Text>
          </View>
        </View>

        {/* Routines Section Header */}
        <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>Routines</Text>

        {/* Workout Plans List */}
        {workoutPlans.length === 0 ? (
          <EmptyState
            icon={<Dumbbell size={48} color={theme.textMuted} />}
            title="No Workout Plans"
            message="This routine doesn't have any workout plans yet"
            theme={theme}
          />
        ) : (
          workoutPlans.map((plan, index) => renderWorkoutPlan(plan, index))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  bookmarkButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  creatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8, // Reduced spacing to title
    marginTop: 8,
  },
  creatorText: {
    fontSize: 14,
  },
  routineName: {
    fontSize: 28, // Prominent size
    fontWeight: '800', // Extra bold
    marginBottom: 20, // Space before save button/description
    marginTop: 4,
    lineHeight: 34,
  },
  saveButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  programDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    minWidth: '45%',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  workoutPlanSection: {
    marginBottom: 0,
  },
  workoutPlanHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 20,
    gap: 12,
  },
  planHeaderContent: {
    flex: 1,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  exerciseList: {
    paddingBottom: 16,
  },
  exerciseCard: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseSetInfo: {
    fontSize: 13,
  },
  exerciseDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    paddingLeft: 68,
  },
  emptyExercises: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});
