import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';

interface StartWorkoutButtonProps {
  workoutPlanId: string;
  workoutPlanName: string;
  onStart?: (workoutPlanId: string) => void;
}

export default function StartWorkoutButton({
  workoutPlanId,
  workoutPlanName,
  onStart,
}: StartWorkoutButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  const handleStart = () => {
    if (onStart) {
      onStart(workoutPlanId);
    } else {
      // TODO: Implement actual workout start logic when ready
      console.log('Starting workout:', workoutPlanId, workoutPlanName);
      Alert.alert(
        'Start Workout',
        `Ready to start "${workoutPlanName}"?\n\nThis feature will be implemented soon!`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start', onPress: () => console.log('Workout started') },
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleStart}
      style={styles.wrapper}
    >
      <LinearGradient
        colors={[theme.accent, theme.accentSecondary]}
        locations={[0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <Play size={20} color={theme.cardText} fill={theme.cardText} />
        <Text style={[styles.buttonText, { color: theme.cardText }]}>
          Start Workout
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
});

