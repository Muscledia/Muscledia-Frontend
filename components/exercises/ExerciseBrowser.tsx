// components/features/ExerciseBrowser.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Search, Filter, X } from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { ExerciseService } from '@/services';
import { Exercise } from '@/types/api';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useHaptics } from '@/hooks/useHaptics';

interface ExerciseBrowserProps {
  onSelectExercise: (exercise: Exercise) => Promise<void>;
}

export interface ExerciseFilters {
  difficulty: string[];
  equipment: string[];
  targetMuscle: string[];
  bodyPart: string[];
}

export function ExerciseBrowser({ onSelectExercise }: ExerciseBrowserProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
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

  // Listen for applied filters from filter screen
  useEffect(() => {
    if (params.appliedFilters) {
      try {
        const filters = JSON.parse(params.appliedFilters as string);
        setActiveFilters(filters);
      } catch (error) {
        console.error('Error parsing filters:', error);
      }
    }
  }, [params.appliedFilters]);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [exercises, searchQuery, activeFilters]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const response = await ExerciseService.getAllExercises();
      if (response.success && response.data) {
        setExercises(response.data);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...exercises];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          ex.targetMuscle?.toLowerCase().includes(query) ||
          ex.equipment?.toLowerCase().includes(query)
      );
    }

    // Apply difficulty filter
    if (activeFilters.difficulty.length > 0) {
      filtered = filtered.filter((ex) =>
        activeFilters.difficulty.includes(ex.difficulty || '')
      );
    }

    // Apply equipment filter
    if (activeFilters.equipment.length > 0) {
      filtered = filtered.filter((ex) =>
        activeFilters.equipment.includes(ex.equipment || '')
      );
    }

    // Apply target muscle filter
    if (activeFilters.targetMuscle.length > 0) {
      filtered = filtered.filter((ex) =>
        activeFilters.targetMuscle.includes(ex.targetMuscle || '')
      );
    }

    // Apply body part filter
    if (activeFilters.bodyPart.length > 0) {
      filtered = filtered.filter((ex) =>
        activeFilters.bodyPart.includes(ex.bodyPart || '')
      );
    }

    setFilteredExercises(filtered);
  };

  const openFilterScreen = async () => {
    await impact('medium');
    router.push({
      pathname: '/exercise-filters',
      params: {
        difficulty: JSON.stringify(activeFilters.difficulty),
        equipment: JSON.stringify(activeFilters.equipment),
        targetMuscle: JSON.stringify(activeFilters.targetMuscle),
        bodyPart: JSON.stringify(activeFilters.bodyPart),
      },
    });
  };

  const clearFilters = async () => {
    await impact('light');
    setActiveFilters({
      difficulty: [],
      equipment: [],
      targetMuscle: [],
      bodyPart: [],
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onSelectExercise(item)}
      style={[styles.exerciseCard, { backgroundColor: theme.surface }]}
    >
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.exerciseImage} />
      )}
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseName, { color: theme.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.exerciseMeta}>
          {item.equipment && (
            <View style={[styles.tag, { backgroundColor: theme.accent + '20' }]}>
              <Text style={[styles.tagText, { color: theme.accent }]}>
                {item.equipment}
              </Text>
            </View>
          )}
          {item.targetMuscle && (
            <View style={[styles.tag, { backgroundColor: theme.textMuted + '20' }]}>
              <Text style={[styles.tagText, { color: theme.textMuted }]}>
                {item.targetMuscle}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const activeFilterCount = getActiveFilterCount();

  if (loading) return <LoadingScreen message="Loading exercises..." theme={theme} />;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
        <Search size={20} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search exercises..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={20} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Button */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openFilterScreen}
          style={[
            styles.filterButton,
            {
              backgroundColor: activeFilterCount > 0 ? theme.accent : theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Filter
            size={18}
            color={activeFilterCount > 0 ? theme.cardText : theme.text}
          />
          <Text
            style={[
              styles.filterButtonText,
              { color: activeFilterCount > 0 ? theme.cardText : theme.text },
            ]}
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Text>
        </TouchableOpacity>

        {activeFilterCount > 0 && (
          <TouchableOpacity
            onPress={clearFilters}
            style={[styles.clearButton, { backgroundColor: theme.surface }]}
          >
            <Text style={[styles.clearButtonText, { color: theme.accent }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Exercise List */}
      {filteredExercises.length === 0 ? (
        <EmptyState
          icon={<Search size={48} color={theme.textMuted} />}
          title="No Exercises Found"
          message={
            searchQuery || activeFilterCount > 0
              ? 'Try adjusting your search or filters'
              : 'No exercises available'
          }
          theme={theme}
        />
      ) : (
        <FlatList
          data={filteredExercises}
          renderItem={renderExerciseCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  exerciseCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#1C1C1C',
  },
  exerciseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
