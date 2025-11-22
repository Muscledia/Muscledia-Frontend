import { useState, useCallback, useEffect } from 'react';
import { Exercise } from '@/types/api';
import { ExerciseService } from '@/services/exerciseService';

export interface ExerciseFilters {
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  searchQuery?: string;
}

interface UseExerciseFiltersProps {
  initialFilters?: ExerciseFilters;
}

export function useExerciseFilters({ initialFilters }: UseExerciseFiltersProps = {}) {
  const [filters, setFilters] = useState<ExerciseFilters>(initialFilters || {});
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(filters.searchQuery);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(filters.searchQuery);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [filters.searchQuery]);

  // Fetch exercises when filters change (using debounced search query)
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryFilters = {
          ...filters,
          search: debouncedSearchQuery, // Use debounced value
        };
        // Remove searchQuery from filters passed to service as it expects 'search'
        delete (queryFilters as any).searchQuery;

        const response = await ExerciseService.getExercises(queryFilters as any);
        if (response.success) {
          setExercises(response.data);
        } else {
          setError(response.message || 'Failed to fetch exercises');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [debouncedSearchQuery, filters.muscleGroup, filters.equipment, filters.difficulty]);

  const updateFilter = useCallback((key: keyof ExerciseFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'All' ? undefined : value, // Handle 'All' as undefined/clear
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    filters,
    updateFilter,
    clearFilters,
    exercises,
    loading,
    error,
  };
}

