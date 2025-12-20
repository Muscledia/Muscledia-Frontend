// app/routine-detail/[id]/edit.tsx
// Edit screen for personal routine folders
// Allows renaming, adding/removing workout plans

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Dumbbell,
  GripVertical,
  Check,
} from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { RoutineService, WorkoutPlanService } from '@/services';
import { RoutineFolder, WorkoutPlan } from '@/types';
import { useHaptics } from '@/hooks/useHaptics';

export default function EditRoutineScreen() {
  const { id, routineData } = useLocalSearchParams<{
    id: string;
    routineData?: string;
  }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

  const [routine, setRoutine] = useState<RoutineFolder | null>(() => {
    if (routineData) {
      try {
        return JSON.parse(routineData);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(!routine);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(routine?.title || '');
  const [description, setDescription] = useState(routine?.description || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!routine && id) {
      loadRoutine();
    }
  }, [id]);

  useEffect(() => {
    if (routine) {
      const titleChanged = title !== routine.title;
      const descChanged = description !== routine.description;
      setHasChanges(titleChanged || descChanged);
    }
  }, [title, description, routine]);

  const loadRoutine = async () => {
    try {
      setLoading(true);
      const response = await RoutineService.getPersonalRoutineFolderById(id);

      if (response.success && response.data) {
        setRoutine(response.data);
        setTitle(response.data.title);
        setDescription(response.data.description || '');
      }
    } catch (error) {
      console.error('Failed to load routine:', error);
      Alert.alert('Error', 'Failed to load routine');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!routine || !title.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }

    try {
      setSaving(true);
      await impact('medium');

      const response = await RoutineService.updatePersonalRoutine(id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });

      if (response.success && response.data) {
        setRoutine(response.data);
        setHasChanges(false);
        await impact('success');
        Alert.alert('Success', 'Routine updated successfully');
      }
    } catch (error) {
      console.error('Failed to update routine:', error);
      await impact('error');
      Alert.alert('Error', 'Failed to update routine');
    } finally {
      setSaving(false);
    }
  };

  const handleAddWorkoutPlan = async () => {
    await impact('medium');

    // Navigate to workout plan selection screen
    router.push({
      pathname: '/workout-plans/browse',
      params: {
        selectMode: 'true',
        routineId: id,
      }
    });
  };

  const handleRemoveWorkoutPlan = async (planId: string) => {
    if (!routine) return;

    const plan = routine.workoutPlans?.find(p => p.id === planId);

    Alert.alert(
      'Remove Workout Plan',
      `Remove "${plan?.title}" from this routine?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await impact('medium');

              const response = await RoutineService.removeWorkoutPlanFromRoutine(
                id,
                planId
              );

              if (response.success && response.data) {
                setRoutine(response.data);
                await impact('success');
              }
            } catch (error) {
              console.error('Failed to remove workout plan:', error);
              await impact('error');
              Alert.alert('Error', 'Failed to remove workout plan');
            }
          },
        },
      ]
    );
  };

  const handlePlanPress = async (planId: string) => {
    await impact('selection');
    router.push({
      pathname: `/workout-plan-detail/${planId}`,
      params: { isPersonal: 'true' }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Routine not found</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            onPress={async () => {
              await impact('light');
              if (hasChanges) {
                Alert.alert(
                  'Unsaved Changes',
                  'You have unsaved changes. Do you want to save before leaving?',
                  [
                    { text: 'Discard', style: 'destructive', onPress: () => router.back() },
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Save', onPress: async () => { await handleSave(); router.back(); } },
                  ]
                );
              } else {
                router.back();
              }
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Routine</Text>

          <TouchableOpacity
            onPress={handleSave}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={theme.accent} />
            ) : (
              <Check
                size={24}
                color={hasChanges ? theme.accent : theme.textMuted}
              />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Routine Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.surface,
                  borderColor: theme.surface,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter routine name"
              placeholderTextColor={theme.textMuted}
              maxLength={100}
            />
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Description</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: theme.text,
                  backgroundColor: theme.surface,
                  borderColor: theme.surface,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a description (optional)"
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* Workout Plans Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Workout Plans ({routine.workoutPlans?.length || 0})
              </Text>
              <TouchableOpacity onPress={handleAddWorkoutPlan} activeOpacity={0.7}>
                <Text style={[styles.addButton, { color: theme.accent }]}>
                  Add Plan
                </Text>
              </TouchableOpacity>
            </View>

            {routine.workoutPlans && routine.workoutPlans.length > 0 ? (
              routine.workoutPlans.map((plan, index) => (
                <WorkoutPlanItem
                  key={plan.id}
                  plan={plan}
                  index={index}
                  theme={theme}
                  onPress={() => handlePlanPress(plan.id)}
                  onDelete={() => handleRemoveWorkoutPlan(plan.id)}
                  impact={impact}
                />
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
                <Dumbbell size={48} color={theme.textMuted} />
                <Text style={[styles.emptyStateText, { color: theme.textMuted }]}>
                  No workout plans yet
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: theme.textMuted }]}>
                  Tap "Add Plan" to get started
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Add Plan Button */}
        {routine.workoutPlans && routine.workoutPlans.length > 0 && (
          <View style={[styles.footer, { backgroundColor: theme.background }]}>
            <TouchableOpacity
              style={[styles.addPlanButton, { backgroundColor: theme.accent }]}
              onPress={handleAddWorkoutPlan}
              activeOpacity={0.8}
            >
              <Plus size={20} color={theme.cardText} />
              <Text style={[styles.addPlanButtonText, { color: theme.cardText }]}>
                Add Workout Plan
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

// Workout Plan Item Component with Swipeable Delete
interface WorkoutPlanItemProps {
  plan: WorkoutPlan;
  index: number;
  theme: any;
  onPress: () => void;
  onDelete: () => void;
  impact: any;
}

const WorkoutPlanItem: React.FC<WorkoutPlanItemProps> = ({
                                                           plan,
                                                           index,
                                                           theme,
                                                           onPress,
                                                           onDelete,
                                                           impact,
                                                         }) => {
  const renderRightActions = () => (
    <TouchableOpacity
      style={[styles.deleteAction, { backgroundColor: '#FF3B30' }]}
      onPress={async () => {
        await impact('medium');
        onDelete();
      }}
      activeOpacity={0.8}
    >
      <Trash2 size={20} color="#FFFFFF" />
      <Text style={styles.deleteActionText}>Remove</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity
        style={[styles.planCard, { backgroundColor: theme.surface }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.planHeader}>
          <View style={[styles.planIcon, { backgroundColor: theme.accent + '20' }]}>
            <Dumbbell size={20} color={theme.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.planTitle, { color: theme.text }]}>
              {plan.title}
            </Text>
            <Text style={[styles.planStats, { color: theme.textMuted }]}>
              {plan.exercises?.length || 0} exercises
            </Text>
          </View>
          <GripVertical size={20} color={theme.textMuted} />
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  planCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  planStats: {
    fontSize: 13,
    marginTop: 4,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginLeft: 8,
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  addPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addPlanButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
