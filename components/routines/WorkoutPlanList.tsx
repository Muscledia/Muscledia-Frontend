import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WorkoutPlan } from '@/types/api';
import { WorkoutPlanCard } from './WorkoutPlanCard';
import { getThemeColors } from '@/constants/Colors';

interface WorkoutPlanListProps {
  workoutPlans: WorkoutPlan[];
  onWorkoutPlanPress: (workoutPlan: WorkoutPlan) => void;
}

export const WorkoutPlanList: React.FC<WorkoutPlanListProps> = ({
  workoutPlans,
  onWorkoutPlanPress,
}) => {
  const theme = getThemeColors(true); // Always use dark mode

  if (workoutPlans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          No workout plans available in this routine.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        WORKOUT PLANS ({workoutPlans.length})
      </Text>
      
      <View style={styles.list}>
        {workoutPlans.map((workoutPlan) => (
          <WorkoutPlanCard
            key={workoutPlan.id}
            workoutPlan={workoutPlan}
            onPress={onWorkoutPlanPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

