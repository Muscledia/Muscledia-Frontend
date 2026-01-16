import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Search, Filter, X } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';

interface ExerciseSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
}

export default function ExerciseSearchBar({ value, onChangeText, onFilterPress }: ExerciseSearchBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Search size={20} color={theme.textMuted} />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholder="Search exercises..."
        placeholderTextColor={theme.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
          <X size={16} color={theme.textMuted} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
        <Filter size={20} color={theme.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    padding: 4,
  },
});

