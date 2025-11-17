import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { getThemeColors } from '@/constants/Colors';
import { Bookmark, Check } from 'lucide-react-native';

interface SaveRoutineButtonProps {
  routineFolderId: string;
  onSave?: () => Promise<void>;
}

export const SaveRoutineButton: React.FC<SaveRoutineButtonProps> = ({
  routineFolderId,
  onSave,
}) => {
  const theme = getThemeColors(true); // Always use dark mode
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (isSaving || isSaved) return;

    try {
      setIsSaving(true);

      if (onSave) {
        await onSave();
      } else {
        // TODO: Implement default save logic when API is ready
        // This would typically call an API endpoint to save the routine to user's collection
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
        console.log('Saving routine folder:', routineFolderId);
      }

      setIsSaved(true);
    } catch (error) {
      console.error('Error saving routine:', error);
      // TODO: Show error toast/alert
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isSaved ? theme.accent + '40' : theme.accent,
          },
        ]}
        onPress={handleSave}
        disabled={isSaving || isSaved}
        activeOpacity={0.9}
      >
        {isSaving ? (
          <>
            <ActivityIndicator size="small" color={theme.cardText} />
            <Text style={[styles.buttonText, { color: theme.cardText }]}>
              Saving...
            </Text>
          </>
        ) : isSaved ? (
          <>
            <Check size={20} color={theme.cardText} />
            <Text style={[styles.buttonText, { color: theme.cardText }]}>
              Saved to My Routines
            </Text>
          </>
        ) : (
          <>
            <Bookmark size={20} color={theme.cardText} />
            <Text style={[styles.buttonText, { color: theme.cardText }]}>
              Save to My Routines
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

