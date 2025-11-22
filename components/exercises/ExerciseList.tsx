import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Exercise } from '@/types/api';
import ExerciseCard from './ExerciseCard';
import { Colors, getThemeColors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

interface ExerciseListProps {
  exercises: Exercise[];
  loading: boolean;
  onRefresh?: () => void;
  onExercisePress?: (exercise: Exercise) => void;
  ListHeaderComponent?: React.ReactElement;
}

export default function ExerciseList({ 
  exercises, 
  loading, 
  onRefresh, 
  onExercisePress,
  ListHeaderComponent 
}: ExerciseListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  const renderEmptyState = () => {
    if (loading) return null; // Show loading indicator instead
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          No exercises found matching your criteria.
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.accent} />
      </View>
    );
  };

  return (
    <FlatList
      data={exercises}
      renderItem={({ item }) => (
        <ExerciseCard 
          exercise={item} 
          onPress={() => onExercisePress?.(item)} 
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderFooter}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={loading && exercises.length > 0}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

