import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  TouchableOpacity,
  Text,
  RefreshControl,
  Modal,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, X, Play } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { WorkoutPlanService, ExerciseService } from '@/services';
import { WorkoutPlanDetail, Exercise } from '@/types/api';
import { useHaptics } from '@/hooks/useHaptics';

// Components
import PlanHeader from '@/components/workoutPlans/PlanHeader';
import ExerciseList from '@/components/workoutPlans/ExerciseList';
import StartWorkoutButton from '@/components/workoutPlans/StartWorkoutButton';

export default function WorkoutPlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

  const [plan, setPlan] = useState<WorkoutPlanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state for exercise details
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  // Fetch workout plan details
  const fetchWorkoutPlanData = async (isRefreshing = false) => {
    if (!id) return;

    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      // Try to fetch detailed workout plan (with exercises embedded)
      const planResponse = await WorkoutPlanService.getWorkoutPlanDetailById(id);

      if (planResponse.success && planResponse.data) {
        setPlan(planResponse.data);
        
        // If exercises are not embedded, fetch them separately
        if (!planResponse.data.exercises || planResponse.data.exercises.length === 0) {
          try {
            const exercisesResponse = await ExerciseService.getExercisesByWorkoutPlanId(id);
            if (exercisesResponse.success && exercisesResponse.data) {
              setPlan(prev => prev ? { ...prev, exercises: exercisesResponse.data } : null);
            }
          } catch (exerciseError) {
            console.warn('Failed to load exercises separately:', exerciseError);
          }
        }
      } else {
        setError(planResponse.message || 'Failed to load workout plan');
      }
    } catch (err: any) {
      console.error('Error fetching workout plan data:', err);
      setError(err.message || 'An error occurred while loading the workout plan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkoutPlanData();
  }, [id]);

  // Pull to refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkoutPlanData(true);
  };

  // Handle exercise press - show modal
  const handleExercisePress = async (exercise: Exercise) => {
    await impact('selection');
    setSelectedExercise(exercise);
    setShowExerciseModal(true);
  };

  // Close modal
  const closeExerciseModal = async () => {
    await impact('light');
    setShowExerciseModal(false);
    setTimeout(() => setSelectedExercise(null), 300);
  };

  // Handle start workout
  const handleStartWorkout = async (planId: string) => {
    await impact('success');
    // TODO: Navigate to workout session screen
    console.log('Start workout session for plan:', planId);
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading workout plan...
        </Text>
      </View>
    );
  }

  // Error state
  if (error || !plan) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <AlertCircle size={64} color={theme.error} />
        <Text style={[styles.errorTitle, { color: theme.text }]}>
          Failed to Load Workout Plan
        </Text>
        <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
          {error || 'Workout plan not found'}
        </Text>
        <TouchableOpacity
          onPress={async () => {
            await impact('medium');
            fetchWorkoutPlanData();
          }}
          style={styles.retryButton}
        >
          <LinearGradient
            colors={[theme.accent, theme.accentSecondary]}
            locations={[0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.retryButtonGradient}
          >
            <Text style={[styles.retryButtonText, { color: theme.cardText }]}>
              Try Again
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // Main content
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      >
        <PlanHeader plan={plan} />

        <StartWorkoutButton
          workoutPlanId={plan.id}
          workoutPlanName={plan.name}
          onStart={handleStartWorkout}
        />

        <View style={styles.divider} />

        <ExerciseList
          exercises={plan.exercises || []}
          onExercisePress={handleExercisePress}
          loading={loading}
        />

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Exercise Detail Modal */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeExerciseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            {/* Close button */}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.surface }]}
              onPress={closeExerciseModal}
            >
              <X size={24} color={theme.text} />
            </TouchableOpacity>

            {selectedExercise && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Exercise Image */}
                {selectedExercise.imageUrl && (
                  <Image
                    source={{ uri: selectedExercise.imageUrl }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                )}

                <View style={styles.modalBody}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {selectedExercise.name}
                  </Text>

                  <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
                    {selectedExercise.description}
                  </Text>

                  {/* Muscle Groups */}
                  {selectedExercise.muscleGroups.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={[styles.modalSectionTitle, { color: theme.text }]}>
                        Target Muscles
                      </Text>
                      <View style={styles.modalTagsContainer}>
                        {selectedExercise.muscleGroups.map((muscle, idx) => (
                          <View
                            key={idx}
                            style={[styles.modalTag, { backgroundColor: theme.accent + '20' }]}
                          >
                            <Text style={[styles.modalTagText, { color: theme.accent }]}>
                              {muscle}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Equipment */}
                  {selectedExercise.equipment.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={[styles.modalSectionTitle, { color: theme.text }]}>
                        Equipment Needed
                      </Text>
                      <View style={styles.modalTagsContainer}>
                        {selectedExercise.equipment.map((item, idx) => (
                          <View
                            key={idx}
                            style={[styles.modalTag, { backgroundColor: theme.textMuted + '20' }]}
                          >
                            <Text style={[styles.modalTagText, { color: theme.textMuted }]}>
                              {item}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Video link placeholder */}
                  {selectedExercise.videoUrl && (
                    <TouchableOpacity
                      style={styles.videoButton}
                      onPress={() => console.log('Play video:', selectedExercise.videoUrl)}
                    >
                      <LinearGradient
                        colors={[theme.accent, theme.accentSecondary]}
                        locations={[0.55, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.videoButtonGradient}
                      >
                        <Play size={20} color={theme.cardText} fill={theme.cardText} />
                        <Text style={[styles.videoButtonText, { color: theme.cardText }]}>
                          Watch Demo Video
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  bottomPadding: {
    height: 24,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#1C1C1C',
  },
  modalBody: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  modalTagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  videoButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  videoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  videoButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

