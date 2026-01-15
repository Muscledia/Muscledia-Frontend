import React from 'react';
import { View, Text, StyleSheet, FlatList, useColorScheme } from 'react-native';
import { Dumbbell } from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { WorkoutPlan } from '@/types';
import WorkoutPlanCard from './WorkoutPlanCard';

interface WorkoutPlanListProps {
  workoutPlans: WorkoutPlan[];
  onPlanPress: (planId: string) => void;
  loading?: boolean;
}

export default function WorkoutPlanList({
  workoutPlans,
  onPlanPress,
  loading = false,
}: WorkoutPlanListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  if (workoutPlans.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Dumbbell size={48} color={theme.textMuted} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>
          No Workout Plans
        </Text>
        <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
          This routine doesn't have any workout plans yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Workout Plans
        </Text>
        <View style={[styles.countBadge, { backgroundColor: theme.accent + '20' }]}>
          <Text style={[styles.countText, { color: theme.accent }]}>
            {workoutPlans.length}
          </Text>
        </View>
      </View>

      <FlatList
        data={workoutPlans}
        renderItem={({ item }) => (
          <WorkoutPlanCard
            workoutPlan={item}
            onPress={() => onPlanPress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
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
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
});

