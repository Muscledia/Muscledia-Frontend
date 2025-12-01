// components/workout/ExerciseCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Exercise } from '@/types/workout.types';
import { SetRow } from './SetRow';

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseIndex: number;
  onToggleComplete: (exerciseIndex: number, setIndex: number, data: any) => Promise<void>;
  onUpdateData: (exerciseIndex: number, setIndex: number, data: any) => Promise<void>;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
                                                            exercise,
                                                            exerciseIndex,
                                                            onToggleComplete,
                                                            onUpdateData,
                                                          }) => {
  if (!exercise || !exercise.sets || exercise.sets.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.exerciseName} numberOfLines={2}>
          {exercise.exerciseName || 'Unknown Exercise'}
        </Text>
        <Text style={styles.completedSets}>
          {exercise.completedSets || 0}/{exercise.sets.length} sets
        </Text>
      </View>

      {exercise.notes && (
        <Text style={styles.notes}>{exercise.notes}</Text>
      )}

      <View style={styles.setsContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>SET</Text>
          <Text style={styles.headerText}>WEIGHT</Text>
          <Text style={styles.headerText}>REPS</Text>
          <Text style={styles.headerText}>RPE</Text>
          <View style={styles.headerCheckbox} />
        </View>

        {exercise.sets.map((set, setIndex) => (
          <SetRow
            key={`${exerciseIndex}-${setIndex}-${set.setNumber}`}
            set={set}
            exerciseIndex={exerciseIndex}
            setIndex={setIndex}
            isCompleted={set.completed || false}
            onToggleComplete={onToggleComplete}
            onUpdateData={onUpdateData}
          />
        ))}
      </View>

      {exercise.totalVolume > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Volume: {exercise.totalVolume.toFixed(1)} kg
          </Text>
          {exercise.maxWeight > 0 && (
            <Text style={styles.footerText}>
              Max: {exercise.maxWeight.toFixed(1)} kg
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  completedSets: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  notes: {
    padding: 16,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  setsContainer: {
    backgroundColor: '#fafafa',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  headerCheckbox: {
    width: 32,
    marginLeft: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
