import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, getThemeColors } from '@/constants/Colors';
import { ArrowLeft, Plus, Trash2, ChevronDown } from 'lucide-react-native';
import { useHaptics } from '@/hooks/useHaptics';

export default function RoutineEditorScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

  const [routineName, setRoutineName] = useState('Chest Day');
  const [exercises, setExercises] = useState([
    {
      id: 1,
      name: 'Bench Press (Barbell)',
      sets: [
        { set: 1, kg: 40, reps: 12, completed: false },
        { set: 2, kg: 42.5, reps: 12, completed: false },
        { set: 3, kg: 45, reps: 12, completed: false },
      ]
    },
    {
      id: 2,
      name: 'Bench Press (Barbell)',
      sets: [
        { set: 1, kg: 40, reps: 12, completed: false },
        { set: 2, kg: 42.5, reps: 12, completed: false },
        { set: 3, kg: 45, reps: 12, completed: false },
      ]
    },
    {
      id: 3,
      name: 'Bench Press (Barbell)',
      sets: [
        { set: 1, kg: 40, reps: 12, completed: false },
        { set: 2, kg: 42.5, reps: 12, completed: false },
        { set: 3, kg: 45, reps: 12, completed: false },
      ]
    },
  ]);

  const addSet = (exerciseId: number) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        const newSetNumber = exercise.sets.length + 1;
        const lastSet = exercise.sets[exercise.sets.length - 1];
        return {
          ...exercise,
          sets: [...exercise.sets, {
            set: newSetNumber,
            kg: lastSet?.kg || 40,
            reps: lastSet?.reps || 12,
            completed: false
          }]
        };
      }
      return exercise;
    }));
    impact('light');
  };

  const updateSet = (exerciseId: number, setIndex: number, field: 'kg' | 'reps', value: string) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        const updatedSets = [...exercise.sets];
        updatedSets[setIndex] = {
          ...updatedSets[setIndex],
          [field]: parseFloat(value) || 0
        };
        return { ...exercise, sets: updatedSets };
      }
      return exercise;
    }));
  };

  const ExerciseCard = ({ exercise }: { exercise: any }) => (
    <View style={[styles.exerciseCard, { backgroundColor: theme.surface }]}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseIcon}>
          <Text style={styles.iconText}>🏋️</Text>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, { color: theme.text }]}>{exercise.name}</Text>
          <Text style={[styles.exerciseSubtext, { color: theme.textSecondary }]}>
            add details here
          </Text>
        </View>
        <TouchableOpacity>
          <ChevronDown size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.restTimer, { color: theme.textSecondary }]}>Rest Timer ⏱️</Text>

      <View style={styles.setsHeader}>
        <Text style={[styles.setLabel, { color: theme.textSecondary }]}>Set</Text>
        <Text style={[styles.setLabel, { color: theme.textSecondary }]}>Kg</Text>
        <Text style={[styles.setLabel, { color: theme.textSecondary }]}>Reps</Text>
        <View style={{ width: 40 }} />
      </View>

      {exercise.sets.map((set: any, index: number) => (
        <View key={index} style={styles.setRow}>
          <Text style={[styles.setNumber, { color: theme.text }]}>{set.set}</Text>
          <TextInput
            style={[styles.setInput, { backgroundColor: theme.background, color: theme.text }]}
            value={set.kg.toString()}
            onChangeText={(value) => updateSet(exercise.id, index, 'kg', value)}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.setInput, { backgroundColor: theme.background, color: theme.text }]}
            value={set.reps.toString()}
            onChangeText={(value) => updateSet(exercise.id, index, 'reps', value)}
            keyboardType="numeric"
          />
          <TouchableOpacity 
            style={[styles.addSetButton, { backgroundColor: theme.accent }]}
            onPress={() => addSet(exercise.id)}
          >
            <Plus size={16} color={theme.cardText} />
            <Text style={[styles.addSetText, { color: theme.cardText }]}>Add Set</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={async () => { await impact('selection'); router.back(); }}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{routineName}</Text>
        <TouchableOpacity onPress={async () => impact('success')}>
          <Text style={[styles.saveButton, { color: theme.accent }]}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* XP Bar at top */}
      <View style={[styles.xpBar, { backgroundColor: theme.accent }]} />

      <ScrollView style={styles.content}>
        {exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.accent }]}
            onPress={async () => impact('light')}
          >
            <Plus size={20} color={theme.cardText} />
            <Text style={[styles.actionButtonText, { color: theme.cardText }]}>Add Exercise</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.error }]}
            onPress={async () => impact('warning')}
          >
            <Text style={[styles.actionButtonText, { color: 'white' }]}>Discard Workout</Text>
          </TouchableOpacity>
        </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  xpBar: {
    height: 4,
    marginHorizontal: 16,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  exerciseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  exerciseSubtext: {
    fontSize: 12,
  },
  restTimer: {
    fontSize: 12,
    marginBottom: 12,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
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
    fontSize: 16,
    fontWeight: '600',
  },
  setInput: {
    flex: 1,
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
    fontSize: 14,
    marginHorizontal: 4,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  addSetText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionButtons: {
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 