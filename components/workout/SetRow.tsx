// components/workout/SetRow.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { WorkoutSet } from '@/types/workout.types';

interface SetRowProps {
  set: WorkoutSet;
  exerciseIndex: number;
  setIndex: number;
  isCompleted: boolean;
  onToggleComplete: (exerciseIndex: number, setIndex: number, data: any) => Promise<void>;
  onUpdateData: (exerciseIndex: number, setIndex: number, data: any) => Promise<void>;
}

export const SetRow: React.FC<SetRowProps> = ({
                                                set,
                                                exerciseIndex,
                                                setIndex,
                                                isCompleted,
                                                onToggleComplete,
                                                onUpdateData,
                                              }) => {
  const [localWeight, setLocalWeight] = useState(set.weightKg?.toString() || '');
  const [localReps, setLocalReps] = useState(set.reps?.toString() || '');
  const [localRpe, setLocalRpe] = useState(set.rpe?.toString() || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCompleteToggle = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const updateData = {
        completed: !isCompleted,
        weightKg: localWeight ? parseFloat(localWeight) : null,
        reps: localReps ? parseInt(localReps, 10) : null,
        rpe: localRpe ? parseInt(localRpe, 10) : null,
      };

      await onToggleComplete(exerciseIndex, setIndex, updateData);
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWeightBlur = async () => {
    if (!isCompleted) return;

    const newWeight = localWeight ? parseFloat(localWeight) : null;
    if (newWeight === set.weightKg) return;

    try {
      await onUpdateData(exerciseIndex, setIndex, { weightKg: newWeight });
    } catch (error) {
      console.error('Failed to update weight:', error);
    }
  };

  const handleRepsBlur = async () => {
    if (!isCompleted) return;

    const newReps = localReps ? parseInt(localReps, 10) : null;
    if (newReps === set.reps) return;

    try {
      await onUpdateData(exerciseIndex, setIndex, { reps: newReps });
    } catch (error) {
      console.error('Failed to update reps:', error);
    }
  };

  const handleRpeBlur = async () => {
    if (!isCompleted) return;

    const newRpe = localRpe ? parseInt(localRpe, 10) : null;
    if (newRpe === set.rpe) return;

    try {
      await onUpdateData(exerciseIndex, setIndex, { rpe: newRpe });
    } catch (error) {
      console.error('Failed to update RPE:', error);
    }
  };

  return (
    <View style={[styles.container, isCompleted && styles.completedContainer]}>
      <Text style={styles.setNumber}>{set.setNumber}</Text>

      <TextInput
        style={[styles.input, isCompleted && styles.completedInput]}
        value={localWeight}
        onChangeText={setLocalWeight}
        onBlur={handleWeightBlur}
        placeholder="kg"
        keyboardType="decimal-pad"
        editable={!isCompleted}
      />

      <Text style={styles.separator}>x</Text>

      <TextInput
        style={[styles.input, isCompleted && styles.completedInput]}
        value={localReps}
        onChangeText={setLocalReps}
        onBlur={handleRepsBlur}
        placeholder="reps"
        keyboardType="number-pad"
        editable={!isCompleted}
      />

      <TextInput
        style={[styles.inputSmall, isCompleted && styles.completedInput]}
        value={localRpe}
        onChangeText={setLocalRpe}
        onBlur={handleRpeBlur}
        placeholder="RPE"
        keyboardType="number-pad"
        editable={!isCompleted}
      />

      <TouchableOpacity
        style={[
          styles.checkbox,
          isCompleted && styles.checkboxCompleted,
          isUpdating && styles.checkboxDisabled
        ]}
        onPress={handleCompleteToggle}
        disabled={isUpdating}
      >
        {isCompleted && <Check size={20} color="#fff" />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  completedContainer: {
    backgroundColor: '#f5f5f5',
  },
  setNumber: {
    width: 40,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  completedInput: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  inputSmall: {
    width: 70,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginLeft: 8,
  },
  separator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginHorizontal: 8,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 6,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
});
