import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Download, Check, Lock } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useRoutineSave } from '@/hooks/useRoutineSave';
import { useHaptics } from '@/hooks/useHaptics';

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
  const { isAuthenticated } = useAuth();
  const { impact } = useHaptics();
  
  const {
    isSaving,
    isSaved,
    isCheckingStatus,
    saveRoutine,
  } = useRoutineSave(routineId, routineName);

  const handlePress = async () => {
    await impact('medium');
    
    if (onSave) {
      // Custom save handler if provided
      await onSave(routineId);
    } else {
      // Use default save logic
      await saveRoutine();
    }
  };

  // Determine button state
  const getButtonState = () => {
    if (isSaved) {
      return {
        colors: ['#4CAF50', '#45A049'],
        icon: <Check size={20} color={theme.cardText} />,
        text: 'Saved to My Routines',
        disabled: true,
      };
    }
    
    if (!isAuthenticated) {
      return {
        colors: [theme.textMuted, theme.textMuted],
        icon: <Lock size={20} color={theme.cardText} />,
        text: 'Login to Save',
        disabled: false,
      };
    }
    
    if (isSaving || isCheckingStatus) {
      return {
        colors: [theme.accent, theme.accentSecondary],
        icon: <ActivityIndicator size="small" color={theme.cardText} />,
        text: isSaving ? 'Saving...' : 'Checking...',
        disabled: true,
      };
    }
    
    return {
      colors: [theme.accent, theme.accentSecondary],
      icon: <Download size={20} color={theme.cardText} />,
      text: 'Save to My Routines',
      disabled: false,
    };
  };

  const buttonState = getButtonState();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      disabled={buttonState.disabled}
      style={[styles.wrapper, buttonState.disabled && styles.disabled]}
    >
      <LinearGradient
        colors={buttonState.colors}
        locations={[0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        {buttonState.icon}
        <Text style={[styles.buttonText, { color: theme.cardText }]}>
          {buttonState.text}
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

