import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Download, Check } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';

interface SaveRoutineButtonProps {
  routineId: string;
  routineName: string;
  onSave?: (routineId: string) => Promise<void>;
}

export default function SaveRoutineButton({
  routineId,
  routineName,
  onSave,
}: SaveRoutineButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (onSave) {
        await onSave(routineId);
      } else {
        // TODO: Implement actual save logic when backend endpoint is ready
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        console.log('Saving routine:', routineId, routineName);
      }

      setIsSaved(true);
      Alert.alert(
        'Success!',
        `"${routineName}" has been saved to your routines.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving routine:', error);
      Alert.alert(
        'Error',
        'Failed to save routine. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleSave}
      disabled={isSaving || isSaved}
      style={[styles.wrapper, (isSaving || isSaved) && styles.disabled]}
    >
      <LinearGradient
        colors={isSaved ? ['#4CAF50', '#45A049'] : [theme.accent, theme.accentSecondary]}
        locations={[0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        {isSaved ? (
          <Check size={20} color={theme.cardText} />
        ) : (
          <Download size={20} color={theme.cardText} />
        )}
        <Text style={[styles.buttonText, { color: theme.cardText }]}>
          {isSaving ? 'Saving...' : isSaved ? 'Saved to My Routines' : 'Save to My Routines'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.7,
  },
});

