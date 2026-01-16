// components/exercise/ExerciseBrowser.tsx - FILTER FIX

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  useColorScheme,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Search, Filter, X } from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { ExerciseService} from '@/services';
import { Exercise } from '@/types';
import { useHaptics } from '@/hooks/useHaptics';
import { ExerciseFilters } from '@/app/exercise-filters';

interface ExerciseBrowserProps {
  onSelectExercise?: (exercise: Exercise) => void;
  theme?: any;
  // FIX: Accept context IDs as props to ensure they are passed to filters
  planId?: string;
  sessionId?: string;
}

export const ExerciseBrowser: React.FC<ExerciseBrowserProps> = ({
                                                                  onSelectExercise,
                                                                  theme: propsTheme,
                                                                  planId, // Receive from parent
                                                                  sessionId // Receive from parent
                                                                }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = propsTheme || getThemeColors(isDark);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { impact } = useHaptics();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ExerciseFilters>({
    difficulty: [],
    equipment: [],
    targetMuscle: [],
    bodyPart: [],
  });

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (params.appliedFilters) {
      try {
        const filters = JSON.parse(params.appliedFilters as string);
        setActiveFilters(filters);
      } catch (error) {
        console.error('Failed to parse filters:', error);
      }
    }
  }, [params.appliedFilters, params._timestamp]);

  useEffect(() => {
    applyFilters();
  }, [exercises, activeFilters, searchQuery]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const response = await ExerciseService.getAllExercises();

      if (response.success && response.data) {
        setExercises(response.data);
        setFilteredExercises(response.data);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...exercises];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(exercise =>
        exercise.name?.toLowerCase().includes(query) ||
        exercise.targetMuscle?.toLowerCase().includes(query) ||
        exercise.equipment?.toLowerCase().includes(query) ||
        exercise.bodyPart?.toLowerCase().includes(query)
      );
    }

    if (activeFilters.difficulty && activeFilters.difficulty.length > 0) {
      filtered = filtered.filter(exercise =>
        exercise.difficulty && activeFilters.difficulty.includes(exercise.difficulty.toUpperCase())
      );
    }

    if (activeFilters.equipment && activeFilters.equipment.length > 0) {
      filtered = filtered.filter(exercise =>
          exercise.equipment && activeFilters.equipment.some(filter =>
            exercise.equipment!.toLowerCase() === filter.toLowerCase()
          )
      );
    }

    if (activeFilters.targetMuscle && activeFilters.targetMuscle.length > 0) {
      filtered = filtered.filter(exercise =>
          exercise.targetMuscle && activeFilters.targetMuscle.some(filter =>
            exercise.targetMuscle!.toLowerCase() === filter.toLowerCase()
          )
      );
    }

    if (activeFilters.bodyPart && activeFilters.bodyPart.length > 0) {
      filtered = filtered.filter(exercise =>
          exercise.bodyPart && activeFilters.bodyPart.some(filter =>
            exercise.bodyPart!.toLowerCase() === filter.toLowerCase()
          )
      );
    }

    setFilteredExercises(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const openFilters = async () => {
    await impact('medium');

    // FIX: Pass the props (planId/sessionId) explicitly to the filter screen
    // This ensures they persist when the user navigates back
    router.push({
      pathname: '/exercise-filters',
      params: {
        difficulty: JSON.stringify(activeFilters.difficulty),
        equipment: JSON.stringify(activeFilters.equipment),
        targetMuscle: JSON.stringify(activeFilters.targetMuscle),
        bodyPart: JSON.stringify(activeFilters.bodyPart),
        planId: planId,       // Pass explicitly
        sessionId: sessionId  // Pass explicitly
      },
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);
  };

  const clearAllFilters = async () => {
    await impact('medium');
    setActiveFilters({
      difficulty: [],
      equipment: [],
      targetMuscle: [],
      bodyPart: [],
    });
    setSearchQuery('');
  };

  const handleExerciseSelect = async (exercise: Exercise) => {
    await impact('medium');
    if (onSelectExercise) {
      onSelectExercise(exercise);
    }
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={[styles.exerciseCard, { backgroundColor: theme.surface }]}
      onPress={() => handleExerciseSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.exerciseHeader}>
        <Text style={[styles.exerciseName, { color: theme.text }]}>{item.name}</Text>
      </View>

      <View style={styles.exerciseTags}>
        {item.targetMuscle && (
          <View style={[styles.tag, { backgroundColor: theme.accent + '20' }]}>
            <Text style={[styles.tagText, { color: theme.accent }]}>
              {item.targetMuscle}
            </Text>
          </View>
        )}
        {item.equipment && (
          <View style={[styles.tag, { backgroundColor: theme.textMuted + '20' }]}>
            <Text style={[styles.tagText, { color: theme.textMuted }]}>
              {item.equipment}
            </Text>
          </View>
        )}
        {item.difficulty && (
          <View style={[styles.tag, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
            <Text style={[styles.tagText, { color: getDifficultyColor(item.difficulty) }]}>
              {item.difficulty}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toUpperCase()) {
      case 'BEGINNER': return '#4CAF50';
      case 'INTERMEDIATE': return '#FF9800';
      case 'ADVANCED': return '#F44336';
      default: return theme.textMuted;
    }
  };

  const activeFilterCount = getActiveFilterCount();

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading exercises...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Search size={20} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search exercises..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.surface }]}
          onPress={openFilters}
          activeOpacity={0.7}
        >
          <Filter size={20} color={theme.accent} />
          {activeFilterCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: theme.accent }]}>
              <Text style={[styles.filterBadgeText, { color: theme.cardText }]}>
                {activeFilterCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersContainer}>
          <Text style={[styles.activeFiltersText, { color: theme.textMuted }]}>
            {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
          </Text>
          <TouchableOpacity onPress={clearAllFilters}>
            <Text style={[styles.clearFiltersText, { color: theme.accent }]}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredExercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No exercises found
            </Text>
            {activeFilterCount > 0 && (
              <TouchableOpacity onPress={clearAllFilters} style={styles.clearButton}>
                <Text style={[styles.clearButtonText, { color: theme.accent }]}>
                  Clear filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  searchContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  filterButton: { width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  filterBadge: { position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  filterBadgeText: { fontSize: 10, fontWeight: 'bold' },
  activeFiltersContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  activeFiltersText: { fontSize: 14, fontWeight: '500' },
  clearFiltersText: { fontSize: 14, fontWeight: '600' },
  listContent: { padding: 16, paddingTop: 0 },
  exerciseCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  exerciseHeader: { marginBottom: 8 },
  exerciseName: { fontSize: 16, fontWeight: '600', textTransform: 'capitalize' },
  exerciseTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagText: { fontSize: 11, fontWeight: '500', textTransform: 'capitalize' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, marginBottom: 16 },
  clearButton: { paddingHorizontal: 20, paddingVertical: 10 },
  clearButtonText: { fontSize: 14, fontWeight: '600' },
});
