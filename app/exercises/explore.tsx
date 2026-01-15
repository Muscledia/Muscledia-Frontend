import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme, TouchableOpacity, Text, Modal, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react-native';
import { router } from 'expo-router';
import { getThemeColors } from '@/constants/Colors';
import { useExerciseFilters } from '@/hooks/useExerciseFilters';
import ExerciseList from '@/components/exercises/ExerciseList';
import ExerciseSearchBar from '@/components/exercises/ExerciseSearchBar';
import ExerciseFilters from '@/components/exercises/ExerciseFilters';
import ExerciseDetailModal from '@/components/exercises/ExerciseDetailModal';
import { Exercise } from '@/types';

export default function ExerciseExploreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const insets = useSafeAreaInsets();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const {
    filters,
    updateFilter,
    exercises,
    loading,
  } = useExerciseFilters();

  const handleExercisePress = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Explore Exercises</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Search and Quick Actions */}
      <ExerciseSearchBar
        value={filters.searchQuery || ''}
        onChangeText={(text) => updateFilter('searchQuery', text)}
        onFilterPress={() => setShowFilters(true)}
      />

      {/* Selected Filters Summary (Horizontal Scroll of active filters could go here if needed) */}

      {/* Main List */}
      <ExerciseList
        exercises={exercises}
        loading={loading}
        onExercisePress={handleExercisePress}
        onRefresh={() => {
          // Trigger a re-fetch by updating search query to itself
          updateFilter('searchQuery', filters.searchQuery);
        }}
      />

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={{ color: theme.accent, fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <ExerciseFilters
            filters={filters}
            onUpdateFilter={updateFilter}
          />
        </View>
      </Modal>

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        visible={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
