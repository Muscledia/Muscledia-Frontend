import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert,
  useColorScheme,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { ArrowLeft, Search, Plus, Dumbbell } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, getThemeColors } from '@/constants/Colors';
import { useRoutines } from '@/hooks/useRoutines';
import { useHaptics } from '@/hooks/useHaptics';
import { SetType } from '@/types/workout.types';

const { width } = Dimensions.get('window');

const categories = ['Popular', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];

const exercises = {
  Popular: [
    { id: 'bench', name: 'Bench Press', description: 'Classic chest exercise', icon: '🏋️', muscle: 'Chest' },
    { id: 'squat', name: 'Squats', description: 'Fundamental leg exercise', icon: '💪', muscle: 'Legs' },
    { id: 'deadlift', name: 'Deadlift', description: 'Full body compound movement', icon: '⚡', muscle: 'Back' },
    { id: 'pull-up', name: 'Pull-ups', description: 'Upper body pulling exercise', icon: '🎯', muscle: 'Back' },
  ],
  Chest: [
    { id: 'bench', name: 'Bench Press', description: 'Classic chest exercise', icon: '🏋️', muscle: 'Chest' },
    { id: 'incline', name: 'Incline Press', description: 'Upper chest focus', icon: '📈', muscle: 'Chest' },
    { id: 'dips', name: 'Dips', description: 'Bodyweight chest exercise', icon: '💎', muscle: 'Chest' },
    { id: 'flyes', name: 'Chest Flyes', description: 'Isolation exercise', icon: '🔥', muscle: 'Chest' },
  ],
  Back: [
    { id: 'deadlift', name: 'Deadlift', description: 'Full body compound movement', icon: '⚡', muscle: 'Back' },
    { id: 'pull-up', name: 'Pull-ups', description: 'Upper body pulling exercise', icon: '🎯', muscle: 'Back' },
    { id: 'rows', name: 'Barbell Rows', description: 'Middle back exercise', icon: '🚣', muscle: 'Back' },
    { id: 'lat-pulldown', name: 'Lat Pulldown', description: 'Lat isolation', icon: '⬇️', muscle: 'Back' },
  ],
  Shoulders: [
    { id: 'press', name: 'Shoulder Press', description: 'Overhead pressing', icon: '🔝', muscle: 'Shoulders' },
    { id: 'lateral', name: 'Lateral Raises', description: 'Side delt isolation', icon: '🔄', muscle: 'Shoulders' },
    { id: 'rear-delt', name: 'Rear Delt Flyes', description: 'Posterior deltoid', icon: '🔙', muscle: 'Shoulders' },
    { id: 'upright', name: 'Upright Rows', description: 'Trap and delt exercise', icon: '📐', muscle: 'Shoulders' },
  ],
  Arms: [
    { id: 'curls', name: 'Bicep Curls', description: 'Bicep isolation', icon: '💪', muscle: 'Arms' },
    { id: 'tricep', name: 'Tricep Extensions', description: 'Tricep isolation', icon: '🔧', muscle: 'Arms' },
    { id: 'hammer', name: 'Hammer Curls', description: 'Neutral grip curls', icon: '🔨', muscle: 'Arms' },
    { id: 'close-grip', name: 'Close Grip Press', description: 'Tricep compound', icon: '🤝', muscle: 'Arms' },
  ],
  Legs: [
    { id: 'squat', name: 'Squats', description: 'Fundamental leg exercise', icon: '💪', muscle: 'Legs' },
    { id: 'lunges', name: 'Lunges', description: 'Single leg strength', icon: '🚶', muscle: 'Legs' },
    { id: 'leg-press', name: 'Leg Press', description: 'Machine quad exercise', icon: '🦵', muscle: 'Legs' },
    { id: 'calf-raise', name: 'Calf Raises', description: 'Calf isolation', icon: '👠', muscle: 'Legs' },
  ],
  Core: [
    { id: 'plank', name: 'Plank', description: 'Core stability', icon: '🏗️', muscle: 'Core' },
    { id: 'crunches', name: 'Crunches', description: 'Abdominal exercise', icon: '🔄', muscle: 'Core' },
    { id: 'leg-raises', name: 'Leg Raises', description: 'Lower ab focus', icon: '🦵', muscle: 'Core' },
    { id: 'russian', name: 'Russian Twists', description: 'Oblique exercise', icon: '🌪️', muscle: 'Core' },
  ],
};

export default function RoutineBuilder() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();
  
  const [selectedCategory, setSelectedCategory] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const { addRoutine } = useRoutines();

  const filteredExercises = exercises[selectedCategory as keyof typeof exercises].filter(
    exercise => exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addExercise = (exercise: any) => {
    const existingExercise = selectedExercises.find(ex => ex.id === exercise.id);
    if (existingExercise) {
      impact('warning');
      Alert.alert('Already Added', `${exercise.name} is already in your routine`);
      return;
    }

    const newExercise = {
      ...exercise,
      sets: [{
        id: `${Date.now()}-1`,
        reps: 12,
        weight: 60,
        completed: false,
        setType: SetType.NORMAL,
      }]
    };

    setSelectedExercises([...selectedExercises, newExercise]);
    impact('light');
    Alert.alert('Added!', `${exercise.name} added to routine`);
  };

  const handleSave = () => {
    if (selectedExercises.length === 0) {
      impact('warning');
      Alert.alert('No Exercises', 'Please add at least one exercise to your routine');
      return;
    }

    Alert.prompt(
      'Name Your Routine',
      'Enter a name for your workout routine:',
      async (text) => {
        if (text && text.trim()) {
          try {
                                      await addRoutine({
               name: text.trim(),
               exercises: selectedExercises,
             });
            impact('success');
            Alert.alert('Success', 'Routine saved successfully!', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          } catch (error) {
            impact('error');
            Alert.alert('Error', 'Failed to save routine');
          }
        }
      },
      'plain-text',
      'My Workout'
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={async () => { await impact('selection'); router.back(); }}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Build Routine</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveButton, { color: theme.accent }]}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Single ScrollView containing everything */}
      <ScrollView 
        style={styles.mainScrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainScrollContent}
      >
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
        </View>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                { 
                  backgroundColor: selectedCategory === category ? theme.accent : theme.surface,
                }
              ]}
              onPress={async () => { await impact('selection'); setSelectedCategory(category); }}
            >
              <Text style={[
                styles.categoryText,
                { 
                  color: selectedCategory === category ? theme.cardText : theme.text,
                  fontWeight: selectedCategory === category ? '600' : '400',
                }
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected Exercises Counter */}
        {selectedExercises.length > 0 && (
          <View style={[styles.counterContainer, { backgroundColor: theme.accent }]}>
            <Dumbbell size={16} color={theme.cardText} />
            <Text style={[styles.counterText, { color: theme.cardText }]}>
              {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''} added
            </Text>
          </View>
        )}

        {/* Exercises Grid - directly in the main scroll */}
        <View style={styles.exercisesGrid}>
          {filteredExercises.map((exercise) => {
            const isSelected = selectedExercises.some(ex => ex.id === exercise.id);
            return (
              <TouchableOpacity
                key={exercise.id}
                style={[
                  styles.exerciseCard,
                  { 
                    backgroundColor: isSelected ? theme.accent : theme.surface,
                    opacity: isSelected ? 0.8 : 1,
                  }
                ]}
                onPress={() => addExercise(exercise)}
                disabled={isSelected}
              >
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                  <View style={[
                    styles.addButton,
                    { 
                      backgroundColor: isSelected ? theme.cardText : theme.accent,
                      opacity: isSelected ? 0.5 : 1,
                    }
                  ]}>
                    <Plus size={16} color={isSelected ? theme.accent : theme.cardText} />
                  </View>
                </View>
                
                <Text style={[
                  styles.exerciseName,
                  { color: isSelected ? theme.cardText : theme.text }
                ]}>
                  {exercise.name}
                </Text>
                
                <Text style={[
                  styles.exerciseDescription,
                  { color: isSelected ? theme.cardText : theme.textMuted }
                ]}>
                  {exercise.description}
                </Text>
                
                <View style={[
                  styles.muscleTag,
                  { backgroundColor: isSelected ? theme.cardText : theme.accent }
                ]}>
                  <Text style={[
                    styles.muscleText,
                    { color: isSelected ? theme.accent : theme.cardText }
                  ]}>
                    {exercise.muscle}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    flex: 1,
    textAlign: 'center' as const,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  searchContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16 },
  categoriesContainer: {
    marginBottom: 0,
    marginHorizontal: 0,
    height: 44,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    alignItems: 'center' as const,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    height: 36,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  categoryText: { fontSize: 14 },
  counterContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  counterText: { fontSize: 12, fontWeight: '600' as const },
  mainScrollContainer: { flex: 1 },
  mainScrollContent: {
    flexGrow: 0,
    paddingBottom: 80,
  },
  exercisesGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  exerciseCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  exerciseIcon: { fontSize: 24 },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  exerciseName: { fontSize: 16, fontWeight: '600' as const, marginBottom: 4 },
  exerciseDescription: { fontSize: 12, marginBottom: 8, lineHeight: 16 },
  muscleTag: { alignSelf: 'flex-start' as const, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  muscleText: { fontSize: 10, fontWeight: '600' as const },
}; 