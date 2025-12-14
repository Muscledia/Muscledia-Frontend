import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Send, ArrowLeft } from 'lucide-react-native';
import { AiService } from '@/services';
import { AiRecommendationRequest, TrainingLevel } from '@/types/api';
import { getThemeColors, Colors } from '@/constants/Colors';
import { useHaptics } from '@/hooks/useHaptics';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function AIRecommendationScreen() {
  const [frequency, setFrequency] = useState<string>('');
  const [level, setLevel] = useState<TrainingLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { impact } = useHaptics();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  const isValid =
    Number(frequency) >= 1 &&
    Number(frequency) <= 6 &&
    level !== null;

  const handleSend = async () => {
    if (!isValid) {
      Alert.alert('Validation Error', 'Please fill in both fields before sending.');
      return;
    }

    await impact('medium');
    setLoading(true);

    try {
      const request: AiRecommendationRequest = {
        frequency: Number(frequency) as 1 | 2 | 3 | 4 | 5 | 6,
        lvlOfTraining: level!,
      };

      const response = await AiService.getRecommendation(request);

      if (response.success && response.data) {
        router.push({
          pathname: '/ai-recommendation/response',
          params: {
            data: JSON.stringify(response.data),
          },
        });
      } else {
        throw new Error(response.message || 'Failed to generate workout plan');
      }
    } catch (err: any) {
      console.error('AI Recommendation Error:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to generate workout plan. Please try again.'
      );
      await impact('error');
    } finally {
      setLoading(false);
    }
  };

  const trainingLevels: { label: string; value: TrainingLevel }[] = [
    { label: 'Beginner', value: 'BEGINNER' },
    { label: 'Intermediate', value: 'INTERMEDIATE' },
    { label: 'Advanced', value: 'ADVANCED' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScreenHeader
        title="AI Workout Plan"
        theme={theme}
        leftAction={{
          icon: <ArrowLeft size={24} color={theme.text} />,
          onPress: () => router.back(),
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
            <Sparkles size={32} color={theme.accent} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            Let AI suggest you a Workout Plan
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Answer a few questions and let AI suggest a personalized workout plan for you
          </Text>
        </View>

        <View style={styles.formSection}>
          {/* Frequency Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              How often per week you want to train? (1-6)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={frequency}
              onChangeText={setFrequency}
              placeholder="Enter 1-6"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              maxLength={1}
              editable={!loading}
            />
          </View>

          {/* Training Level Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              Training Level
            </Text>
            <View style={styles.levelButtons}>
              {trainingLevels.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    if (!loading) {
                      impact('light');
                      setLevel(item.value);
                    }
                  }}
                  disabled={loading}
                  style={[
                    styles.levelButton,
                    {
                      backgroundColor:
                        level === item.value ? theme.accent : theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.levelButtonText,
                      {
                        color:
                          level === item.value
                            ? theme.cardText
                            : theme.text,
                        fontWeight: level === item.value ? '600' : '400',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={!isValid || loading}
            activeOpacity={0.9}
            style={styles.sendButton}
          >
            <LinearGradient
              colors={
                isValid && !loading
                  ? [theme.accent, theme.accentSecondary]
                  : [theme.textMuted, theme.textMuted]
              }
              locations={[0.55, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.cardText} />
              ) : (
                <>
                  <Send size={20} color={theme.cardText} />
                  <Text style={[styles.sendButtonText, { color: theme.cardText }]}>
                    Generate Plan
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
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
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formSection: {
    gap: 24,
  },
  inputGroup: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  sendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});