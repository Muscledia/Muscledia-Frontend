import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors, getThemeColors } from '@/constants/Colors';
import { ArrowLeft, Check, X, ChevronDown, Plus, Edit } from 'lucide-react-native';
import { useRoutines } from '@/hooks/useRoutines';
import { useCharacter } from '@/hooks/useCharacter';
import { useRaid } from '@/hooks/useRaid';
import { useLeagues } from '@/hooks/useLeagues';
import { useHaptics } from '@/hooks/useHaptics';
import { useWorkouts } from '@/hooks/useWorkouts';
import { SetType } from '@/types/workout.types';

export default function RoutineWorkoutScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { getRoutine, markSetCompleted, deleteRoutine, updateRoutine } = useRoutines();
  const { incrementXP, character, consumeHealth, applyHealthRegen } = useCharacter();
  const { contributeSets } = useRaid();
  const { addPoints } = useLeagues();
  const { impact } = useHaptics();
  const { upsertTodayWorkout, workouts } = useWorkouts();
  
  const [routine, setRoutine] = useState<any>(null);
  const [expandedExercises, setExpandedExercises] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingValues, setEditingValues] = useState<Record<string, { weight: string; reps: string }>>({});

  // Load routine and expand sections
  useEffect(() => {
    if (id) {
      const foundRoutine = getRoutine(id as string);
      setRoutine(foundRoutine);
      if (foundRoutine) {
        setExpandedExercises(foundRoutine.exercises.map((ex: any) => ex.id));
      }
    }
  }, [id]);

  // On first load with routine, apply regen (daily routine limit removed)
  useEffect(() => {
    if (!routine) return;
    applyHealthRegen();
  }, [routine]);

  // Initialize editing values when entering edit mode
  useEffect(() => {
    if (!routine || !isEditMode) return;
    const map: Record<string, { weight: string; reps: string }> = {};
    routine.exercises.forEach((ex: any) => {
      ex.sets.forEach((s: any) => {
        map[s.id] = { weight: String(s.weight ?? ''), reps: String(s.reps ?? '') };
      });
    });
    setEditingValues(map);
  }, [routine, isEditMode]);

  const handleSetCompletion = async (exerciseId: string, setId: string, currentStatus: boolean) => {
    if (!routine) return;

    const newStatus = !currentStatus;

    // If marking as complete, ensure there is health and consume it
    if (newStatus) {
      if (character.currentHealth <= 0) {
        Alert.alert('Out of Health', 'You need to wait for health to regenerate before completing more sets.');
        return;
      }
      const stillAlive = consumeHealth(1); // cost per set
      if (!stillAlive && character.currentHealth <= 1) {
        Alert.alert('Out of Health', 'You reached 0 health. Come back later to continue.');
      }
    }

    await markSetCompleted(routine.id, exerciseId, setId, newStatus);

    // Give XP only when completing
    if (newStatus) {
      incrementXP(10);
      // contribute to weekly raid boss
      contributeSets(1);
      // contribute to monthly leagues points (1 point per completed set)
      addPoints(1);
      impact('success');
    } else {
      impact('selection');
    }

    // Update local state mirror
    const updatedRoutine = { ...routine };
    const exercise = updatedRoutine.exercises.find((ex: any) => ex.id === exerciseId);
    if (exercise) {
      const set = exercise.sets.find((s: any) => s.id === setId);
      if (set) {
        set.completed = newStatus;
        setRoutine(updatedRoutine);
      }
    }

    // Upsert a detailed workout entry for today (by routine)
    if (newStatus) {
      let completedSets = 0;
      let totalSets = 0;
      const details = updatedRoutine.exercises.map((ex: any) => ({
        exerciseId: ex.id,
        name: ex.name,
        sets: ex.sets.map((s: any) => {
          totalSets++;
          if (s.completed) completedSets++;
          return {
            id: s.id,
            reps: Number(s.reps) || 0,
            weight: Number(s.weight) || 0,
            completed: !!s.completed,
          };
        })
      }));
      try {
        await upsertTodayWorkout(
          { name: routine.name, routineId: routine.id },
          {
            name: routine.name,
            routineId: routine.id,
            sets: `${completedSets}/${totalSets}`,
            reps: '-',
            weight: '-',
            details,
          }
        );
      } catch (e) {
        // ignore logging errors
      }
    }
  };

  const toggleExerciseExpansion = (exerciseId: string) => {
    setExpandedExercises(prev =>
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const commitEdits = async () => {
    if (!routine) return;
    const newExercises = routine.exercises.map((ex: any) => ({
      ...ex,
      sets: ex.sets.map((s: any) => {
        const ev = editingValues[s.id];
        const nextWeight = ev ? Math.max(0, parseFloat(ev.weight) || 0) : s.weight;
        const nextReps = ev ? Math.max(0, parseFloat(ev.reps) || 0) : s.reps;
        return { ...s, weight: nextWeight, reps: nextReps };
      }),
    }));
    await updateRoutine(routine.id, { exercises: newExercises });
    setRoutine({ ...routine, exercises: newExercises });
  };

  const addSetToExercise = (exerciseId: string) => {
    if (!routine) return;
    const updated = { ...routine };
    const ex = updated.exercises.find((e: any) => e.id === exerciseId);
    if (!ex) return;
    const newSet = { 
      id: Date.now().toString(), 
      reps: ex.sets[ex.sets.length - 1]?.reps || 10, 
      weight: ex.sets[ex.sets.length - 1]?.weight || 0, 
      completed: false,
      setType: SetType.NORMAL
    };
    ex.sets = [
      ...ex.sets,
      newSet,
    ];
    setRoutine(updated);
    setEditingValues(prev => ({ ...prev, [newSet.id]: { weight: String(newSet.weight), reps: String(newSet.reps) } }));
  };

  const handleDeleteRoutine = () => {
    Alert.alert(
      'Delete Routine',
      'Are you sure you want to delete this routine? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRoutine(routine.id);
            router.back();
          },
        },
      ]
    );
  };

  const getTotalSets = () => {
    if (!routine) return { completed: 0, total: 0 };
    
    let completed = 0;
    let total = 0;
    
    routine.exercises.forEach((exercise: any) => {
      exercise.sets.forEach((set: any) => {
        total++;
        if (set.completed) completed++;
      });
    });
    
    return { completed, total };
  };

  if (!routine) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Routine not found</Text>
      </View>
    );
  }

  const { completed, total } = getTotalSets();
  const progress = total > 0 ? completed / total : 0;

  const ExerciseCard = ({ exercise }: { exercise: any }) => {
    const isExpanded = expandedExercises.includes(exercise.id);
    const completedSets = exercise.sets.filter((set: any) => set.completed).length;
    
    return (
      <View style={[styles.exerciseCard, { backgroundColor: theme.surface }]}>
        <TouchableOpacity 
          style={styles.exerciseHeader}
          onPress={() => toggleExerciseExpansion(exercise.id)}
        >
          <View style={styles.exerciseIcon}>
            <Text style={styles.iconText}>🏋️</Text>
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={[styles.exerciseName, { color: theme.text }]}>{exercise.name}</Text>
            <Text style={[styles.exerciseProgress, { color: theme.textSecondary }]}>
              {completedSets}/{exercise.sets.length} sets completed
            </Text>
          </View>
          <ChevronDown 
            size={20} 
            color={theme.textMuted} 
            style={{ 
              transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] 
            }} 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.setsContainer}>
            <View style={styles.setsHeader}>
              <Text style={[styles.setLabel, { color: theme.textSecondary }]}>Set</Text>
              <Text style={[styles.setLabel, { color: theme.textSecondary }]}>Weight</Text>
              <Text style={[styles.setLabel, { color: theme.textSecondary }]}>Reps</Text>
              <Text style={[styles.setLabel, { color: theme.textSecondary }]}>✓</Text>
            </View>

            {exercise.sets.map((set: any, index: number) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={[styles.setNumber, { color: theme.text }]}>{index + 1}</Text>
                {isEditMode ? (
                  <TextInput
                    style={[styles.setInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    value={editingValues[set.id]?.weight ?? String(set.weight)}
                    onChangeText={(v) => setEditingValues(prev => ({ ...prev, [set.id]: { weight: v, reps: prev[set.id]?.reps ?? String(set.reps) } }))}
                    keyboardType="numeric"
                    inputMode="numeric"
                    blurOnSubmit={false}
                  />
                ) : (
                  <Text style={[styles.setValue, { color: theme.text }]}>{set.weight}kg</Text>
                )}
                {isEditMode ? (
                  <TextInput
                    style={[styles.setInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    value={editingValues[set.id]?.reps ?? String(set.reps)}
                    onChangeText={(v) => setEditingValues(prev => ({ ...prev, [set.id]: { weight: prev[set.id]?.weight ?? String(set.weight), reps: v } }))}
                    keyboardType="numeric"
                    inputMode="numeric"
                    blurOnSubmit={false}
                  />
                ) : (
                  <Text style={[styles.setValue, { color: theme.text }]}>{set.reps}</Text>
                )}
                <TouchableOpacity
                  style={[
                    styles.checkBox,
                    { 
                      backgroundColor: set.completed ? theme.accent : 'transparent',
                      borderColor: set.completed ? theme.accent : theme.border,
                    }
                  ]}
                  onPress={() => !isEditMode && handleSetCompletion(exercise.id, set.id, set.completed)}
                >
                  {set.completed && <Check size={16} color={theme.cardText} />}
                </TouchableOpacity>
              </View>
            ))}

            {isEditMode && (
              <TouchableOpacity
                style={[styles.addSetBtn, { backgroundColor: theme.accent }]}
                onPress={() => addSetToExercise(exercise.id)}
              >
                <Plus size={16} color={theme.cardText} />
                <Text style={[styles.addSetLabel, { color: theme.cardText }]}>Add Set</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={async () => { await impact('selection'); router.back(); }}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{routine.name}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={async () => { 
              await impact('selection'); 
              if (isEditMode) {
                await commitEdits();
              }
              setIsEditMode(!isEditMode); 
            }}
            style={[styles.editButton, { backgroundColor: isEditMode ? theme.accent : 'transparent' }]}
          >
            <Edit size={20} color={isEditMode ? theme.cardText : theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => { await impact('warning'); handleDeleteRoutine(); }}>
            <X size={24} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Health info */}
      <View style={[styles.progressContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.progressText, { color: theme.text }]}>Health: {character.currentHealth}/{character.maxHealth}</Text>
        <View style={[styles.progressBar, { backgroundColor: theme.background }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: theme.health,
                width: `${(character.currentHealth / character.maxHealth) * 100}%`,
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressPercent, { color: theme.textSecondary }]}>Regenerates over time</Text>
      </View>

      {/* Exercises List */}
      <ScrollView style={styles.content} keyboardShouldPersistTaps="always" keyboardDismissMode="none">
        {routine.exercises.map((exercise: any) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}

        {/* Completion Message */}
        {progress === 1 && (
          <View style={[styles.completionCard, { backgroundColor: theme.accent }]}>
            <Text style={[styles.completionText, { color: theme.cardText }]}>🎉 Workout Complete! Great job!</Text>
            <Text style={[styles.completionSubtext, { color: theme.cardText }]}>You earned {total * 10} XP for completing all sets!</Text>
          </View>
        )}
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
    padding: 16,
    paddingTop: 60,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  progressContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  exerciseCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  exerciseProgress: {
    fontSize: 12,
  },
  setsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
  },
  setLabel: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setNumber: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  setValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  setInput: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 14,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 8,
  },
  completionCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  completionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  completionSubtext: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 4,
    marginRight: 8,
  },
  addSetLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 