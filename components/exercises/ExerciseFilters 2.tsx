import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { ExerciseFilters as FilterType } from '@/hooks/useExerciseFilters';

interface ExerciseFiltersProps {
  filters: FilterType;
  onUpdateFilter: (key: keyof FilterType, value: string | undefined) => void;
}

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
const EQUIPMENT = ['All', 'Dumbbell', 'Barbell', 'Machine', 'Bodyweight', 'Cables', 'Kettlebell'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function ExerciseFilters({ filters, onUpdateFilter }: ExerciseFiltersProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  const renderFilterSection = (
    title: string,
    options: string[],
    selectedValue: string | undefined,
    filterKey: keyof FilterType
  ) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => {
          const isSelected = option === 'All' 
            ? !selectedValue 
            : selectedValue === option;

          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.chip,
                { 
                  backgroundColor: isSelected ? theme.accent : theme.surface,
                  borderColor: isSelected ? theme.accent : theme.border,
                }
              ]}
              onPress={() => onUpdateFilter(filterKey, option)}
            >
              <Text 
                style={[
                  styles.chipText,
                  { color: isSelected ? '#fff' : theme.text }
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderFilterSection('Muscle Group', MUSCLE_GROUPS, filters.muscleGroup, 'muscleGroup')}
      {renderFilterSection('Equipment', EQUIPMENT, filters.equipment, 'equipment')}
      {renderFilterSection('Difficulty', DIFFICULTIES, filters.difficulty, 'difficulty')}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

