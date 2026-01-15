import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, X, Sparkles } from 'lucide-react-native';
import { AiRecommendationResponse } from '@/types';
import { RoutineService } from '@/services';
import { getThemeColors, Colors } from '@/constants/Colors';
import { useHaptics } from '@/hooks/useHaptics';
import { useAuth } from '@/hooks/useAuth';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function AIResponseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { impact } = useHaptics();
  const { isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  const [responseData, setResponseData] = useState<AiRecommendationResponse | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      if (params.data) {
        const parsed = JSON.parse(params.data as string);
        setResponseData(parsed);
      }
    } catch (error) {
      console.error('Error parsing response data:', error);
      Alert.alert('Error', 'Failed to load AI recommendation');
      router.back();
    }
  }, [params.data]);

  const handleAddToCollection = async () => {
    if (!responseData?.routineId) {
      Alert.alert('Error', 'No routine ID found');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'You need to be logged in to save routines to your collection.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => router.push('/(auth)/login'),
          },
        ]
      );
      return;
    }

    await impact('medium');
    setSaving(true);

    try {
      const saveResponse = await RoutineService.savePublicRoutine(responseData.routineId);

      if (saveResponse.success) {
        await impact('success');
        Alert.alert(
          'Success!',
          saveResponse.data?.message || 'Workout plan has been added to your collection.',
          [
            {
              text: 'View My Routines',
              onPress: () => {
                router.replace('/(tabs)');
              },
            },
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(tabs)');
              },
            },
          ]
        );
      } else {
        throw new Error(saveResponse.message || 'Failed to save routine');
      }
    } catch (error: any) {
      console.error('Error saving routine:', error);
      await impact('error');
      Alert.alert(
        'Error',
        error.message || 'Failed to add workout plan to your collection. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    router.replace('/(tabs)');
  };

  if (!responseData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScreenHeader title="AI Recommendation" theme={theme} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader title="AI Recommendation" theme={theme} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Success Header */}
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
            <Sparkles size={32} color={theme.accent} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            Your AI Workout Plan
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Generated based on your preferences
          </Text>
        </View>

        {/* Workout Details Card */}
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          {responseData.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Description
              </Text>
              <Text style={[styles.sectionContent, { color: theme.textSecondary }]}>
                {responseData.description}
              </Text>
            </View>
          )}

          {responseData.difficultyLevel && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Difficulty Level
              </Text>
              <Text style={[styles.sectionContent, { color: theme.textSecondary }]}>
                {responseData.difficultyLevel}
              </Text>
            </View>
          )}

          {responseData.workoutSplit && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Workout Split
              </Text>
              <Text style={[styles.sectionContent, { color: theme.textSecondary }]}>
                {responseData.workoutSplit}
              </Text>
            </View>
          )}

          {responseData.suggestedWorkoutRoutine && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Suggested Routine
              </Text>
              <Text style={[styles.routineText, { color: theme.textSecondary }]}>
                {responseData.suggestedWorkoutRoutine}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.buttonContainer, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          onPress={handleClose}
          style={[styles.closeButton, { backgroundColor: theme.surface }]}
          activeOpacity={0.9}
        >
          <X size={20} color={theme.text} />
          <Text style={[styles.closeButtonText, { color: theme.text }]}>Close</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAddToCollection}
          disabled={saving}
          style={styles.addButton}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[theme.accent, theme.accentSecondary]}
            locations={[0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addGradient}
          >
            {saving ? (
              <ActivityIndicator size="small" color={theme.cardText} />
            ) : (
              <>
                <CheckCircle2 size={20} color={theme.cardText} />
                <Text style={[styles.addButtonText, { color: theme.cardText }]}>
                  Add to My Collection
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  routineText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});