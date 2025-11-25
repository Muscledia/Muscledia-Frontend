import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SetType } from '@/types/workout.types';
import { SET_TYPE_CONFIGS } from '@/constants/setTypes';

interface SetTypeSelectorProps {
  value: SetType;
  onChange: (type: SetType) => void;
}

export const SetTypeSelector: React.FC<SetTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Set Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {SET_TYPE_CONFIGS.map((config) => {
          const isSelected = value === config.value;
          return (
            <TouchableOpacity
              key={config.value}
              style={[
                styles.chip,
                isSelected && { backgroundColor: config.color, borderColor: config.color },
                !isSelected && { borderColor: '#374151' } // Dark gray border for unselected
              ]}
              onPress={() => onChange(config.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? { color: 'white' } : { color: '#9CA3AF' } // White if selected, gray if not
                ]}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {/* Optional: Show description of selected type */}
      {(() => {
        const selectedConfig = SET_TYPE_CONFIGS.find(c => c.value === value);
        if (selectedConfig) {
          return (
            <Text style={styles.description}>
              {selectedConfig.description}
            </Text>
          );
        }
        return null;
      })()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB', // Light gray
    marginBottom: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: '#1F2937', // Dark background
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    color: '#9CA3AF', // Gray
    marginTop: 8,
    fontStyle: 'italic',
  },
});
