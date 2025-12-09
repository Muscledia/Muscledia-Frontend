import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Check,
  RotateCcw,
  Dumbbell,
  Zap,
  Target,
  User,
} from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { useHaptics } from '@/hooks/useHaptics';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface ExerciseFilters {
  difficulty: string[];
  equipment: string[];
  targetMuscle: string[];
  bodyPart: string[];
}

const DIFFICULTY_OPTIONS: FilterOption[] = [
  { id: 'beginner', label: 'Beginner', value: 'BEGINNER' },
  { id: 'intermediate', label: 'Intermediate', value: 'INTERMEDIATE' },
  { id: 'advanced', label: 'Advanced', value: 'ADVANCED' },
];

const EQUIPMENT_OPTIONS: FilterOption[] = [
  { id: 'body_weight', label: 'Body Weight', value: 'body weight' },
  { id: 'barbell', label: 'Barbell', value: 'barbell' },
  { id: 'dumbbell', label: 'Dumbbell', value: 'dumbbell' },
  { id: 'cable', label: 'Cable', value: 'cable' },
  { id: 'machine', label: 'Machine', value: 'leverage machine' },
  { id: 'kettlebell', label: 'Kettlebell', value: 'kettlebell' },
  { id: 'resistance_band', label: 'Resistance Band', value: 'resistance band' },
  { id: 'medicine_ball', label: 'Medicine Ball', value: 'medicine ball' },
  { id: 'stability_ball', label: 'Stability Ball', value: 'stability ball' },
  { id: 'foam_roll', label: 'Foam Roll', value: 'foam roll' },
];

const TARGET_MUSCLE_OPTIONS: FilterOption[] = [
  { id: 'chest', label: 'Chest', value: 'pectorals' },
  { id: 'back', label: 'Back', value: 'lats' },
  { id: 'shoulders', label: 'Shoulders', value: 'delts' },
  { id: 'biceps', label: 'Biceps', value: 'biceps' },
  { id: 'triceps', label: 'Triceps', value: 'triceps' },
  { id: 'forearms', label: 'Forearms', value: 'forearms' },
  { id: 'abs', label: 'Abs', value: 'abs' },
  { id: 'quads', label: 'Quads', value: 'quads' },
  { id: 'hamstrings', label: 'Hamstrings', value: 'hamstrings' },
  { id: 'calves', label: 'Calves', value: 'calves' },
  { id: 'glutes', label: 'Glutes', value: 'glutes' },
  { id: 'traps', label: 'Traps', value: 'traps' },
];

const BODY_PART_OPTIONS: FilterOption[] = [
  { id: 'upper_arms', label: 'Upper Arms', value: 'upper arms' },
  { id: 'lower_arms', label: 'Lower Arms', value: 'lower arms' },
  { id: 'chest', label: 'Chest', value: 'chest' },
  { id: 'back', label: 'Back', value: 'back' },
  { id: 'shoulders', label: 'Shoulders', value: 'shoulders' },
  { id: 'waist', label: 'Waist/Core', value: 'waist' },
  { id: 'upper_legs', label: 'Upper Legs', value: 'upper legs' },
  { id: 'lower_legs', label: 'Lower Legs', value: 'lower legs' },
  { id: 'cardio', label: 'Cardio', value: 'cardio' },
  { id: 'neck', label: 'Neck', value: 'neck' },
];

export default function ExerciseFiltersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const router = useRouter();
  const { impact } = useHaptics();
  const params = useLocalSearchParams();

  // Parse existing filters from params
  const initialFilters: ExerciseFilters = {
    difficulty: params.difficulty ? JSON.parse(params.difficulty as string) : [],
    equipment: params.equipment ? JSON.parse(params.equipment as string) : [],
    targetMuscle: params.targetMuscle ? JSON.parse(params.targetMuscle as string) : [],
    bodyPart: params.bodyPart ? JSON.parse(params.bodyPart as string) : [],
  };

  const [selectedFilters, setSelectedFilters] = useState<ExerciseFilters>(initialFilters);

  const toggleFilter = (category: keyof ExerciseFilters, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[category];
      const isSelected = current.includes(value);

      return {
        ...prev,
        [category]: isSelected
          ? current.filter(v => v !== value)
          : [...current, value],
      };
    });
  };

  const isFilterSelected = (category: keyof ExerciseFilters, value: string) => {
    return selectedFilters[category].includes(value);
  };

  const clearAllFilters = async () => {
    await impact('medium');
    setSelectedFilters({
      difficulty: [],
      equipment: [],
      targetMuscle: [],
      bodyPart: [],
    });
  };

  const applyFilters = async () => {
    await impact('success');

    // FIX: Use router.navigate to pass params back to the existing screen in the stack
    // router.back() does not pass params.
    router.navigate({
      pathname: '/exercises/browse',
      params: {
        appliedFilters: JSON.stringify(selectedFilters),
        _timestamp: Date.now().toString(), // Force update hook
        // Preserve other context params if they exist
        planId: params.planId,
        sessionId: params.sessionId
      },
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0);
  };

  const renderFilterSection = (
    title: string,
    icon: React.ReactNode,
    category: keyof ExerciseFilters,
    options: FilterOption[]
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      </View>
      <View style={styles.optionsGrid}>
        {options.map((option) => {
          const isSelected = isFilterSelected(category, option.value);
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.7}
              onPress={async () => {
                await impact('light');
                toggleFilter(category, option.value);
              }}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? theme.accent : theme.surface,
                  borderColor: isSelected ? theme.accent : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: isSelected ? theme.cardText : theme.text },
                ]}
              >
                {option.label}
              </Text>
              {isSelected && <Check size={16} color={theme.cardText} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const activeCount = getActiveFilterCount();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader
        title="Filter Exercises"
        leftAction={{
          icon: <X size={24} color={theme.text} />,
          onPress: () => router.back(),
        }}
        rightAction={
          activeCount > 0
            ? {
              icon: <RotateCcw size={20} color={theme.accent} />,
              onPress: clearAllFilters,
            }
            : undefined
        }
        theme={theme}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeCount > 0 && (
          <View style={[styles.activeFiltersCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.activeFiltersText, { color: theme.textSecondary }]}>
              {activeCount} {activeCount === 1 ? 'filter' : 'filters'} active
            </Text>
          </View>
        )}

        {renderFilterSection(
          'Difficulty Level',
          <Zap size={20} color={theme.accent} />,
          'difficulty',
          DIFFICULTY_OPTIONS
        )}

        {renderFilterSection(
          'Equipment',
          <Dumbbell size={20} color={theme.accent} />,
          'equipment',
          EQUIPMENT_OPTIONS
        )}

        {renderFilterSection(
          'Target Muscle',
          <Target size={20} color={theme.accent} />,
          'targetMuscle',
          TARGET_MUSCLE_OPTIONS
        )}

        {renderFilterSection(
          'Body Part',
          <User size={20} color={theme.accent} />,
          'bodyPart',
          BODY_PART_OPTIONS
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Apply Button */}
      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={applyFilters}
          style={styles.applyButton}
        >
          <LinearGradient
            colors={[theme.accent, theme.accentSecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.applyGradient}
          >
            <Check size={20} color={theme.cardText} />
            <Text style={[styles.applyButtonText, { color: theme.cardText }]}>
              Apply Filters {activeCount > 0 && `(${activeCount})`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  activeFiltersCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  activeFiltersText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  applyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  applyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
