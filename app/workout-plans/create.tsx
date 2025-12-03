// app/workout-plans/create.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { WorkoutPlanService, CreateWorkoutPlanRequest } from '@/services';
import { useHaptics } from '@/hooks/useHaptics';

export default function CreateWorkoutPlanScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreatePlan = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a workout plan title');
      return;
    }

    await impact('medium');
    setLoading(true);

    try {
      const request: CreateWorkoutPlanRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        exercises: [],
        isPublic,
      };

      const response = await WorkoutPlanService.createWorkoutPlan(request);

      if (response.success && response.data) {
        await impact('success');
        Alert.alert('Success', 'Workout plan created!', [
          {
            text: 'OK',
            onPress: () => {
              router.replace({
                pathname: '/workout-plans/[planId]/edit',
                params: { planId: response.data.id },
              });
            },
          },
        ]);
      } else {
        throw new Error(response.message || 'Failed to create workout plan');
      }
    } catch (error: any) {
      console.error('Failed to create workout plan:', error);
      Alert.alert('Error', error.message || 'Failed to create workout plan');
      await impact('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          onPress={async () => {
            await impact('light');
            router.back();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Create Workout Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Plan Name *</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.surface,
                borderColor: theme.surface,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Upper Body Strength"
            placeholderTextColor={theme.textMuted}
            maxLength={100}
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                color: theme.text,
                backgroundColor: theme.surface,
                borderColor: theme.surface,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description for this plan..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        {/* Public Toggle */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={async () => {
              await impact('light');
              setIsPublic(!isPublic);
            }}
            activeOpacity={0.7}
          >
            <View>
              <Text style={[styles.label, { color: theme.text }]}>Make Public</Text>
              <Text style={[styles.helperText, { color: theme.textMuted }]}>
                Allow others to view and use this plan
              </Text>
            </View>
            <View
              style={[
                styles.toggle,
                {
                  backgroundColor: isPublic ? theme.accent : theme.surface,
                },
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  {
                    backgroundColor: theme.cardText,
                    transform: [{ translateX: isPublic ? 22 : 2 }],
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Button */}
      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          style={[
            styles.createButton,
            {
              backgroundColor: theme.accent,
              opacity: !title.trim() || loading ? 0.5 : 1,
            },
          ]}
          onPress={handleCreatePlan}
          disabled={!title.trim() || loading}
          activeOpacity={0.8}
        >
          <Plus size={20} color={theme.cardText} />
          <Text style={[styles.createButtonText, { color: theme.cardText }]}>
            {loading ? 'Creating...' : 'Create Plan'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    marginTop: 4,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
