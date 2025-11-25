import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert,
  useColorScheme,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { ArrowLeft, Save } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, getThemeColors } from '@/constants/Colors';
import { useHaptics } from '@/hooks/useHaptics';
import { RoutineService } from '@/services';
import { LinearGradient } from 'expo-linear-gradient';

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const EQUIPMENT_TYPES = ['Gym', 'Dumbbells', 'Bodyweight', 'Home Gym'];
const WORKOUT_SPLITS = ['Upper/Lower', 'PPL', 'Full Body', 'Bro Split', 'Custom'];

export default function RoutineBuilder() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficultyLevel: 'Intermediate',
    equipmentType: 'Gym',
    workoutSplit: 'Upper/Lower',
    routineCount: '5'
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      impact('warning');
      Alert.alert('Missing Title', 'Please enter a title for your routine collection.');
      return;
    }

    try {
      setLoading(true);
      const response = await RoutineService.createPersonalRoutine({
        title: formData.title,
        description: formData.description,
        difficultyLevel: formData.difficultyLevel,
        equipmentType: formData.equipmentType,
        workoutSplit: formData.workoutSplit,
        workoutPlanCount: parseInt(formData.routineCount) || 5,
      });

      if (response.success) {
        await impact('success');
        Alert.alert('Success', 'Routine collection created successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        throw new Error(response.message || 'Failed to create routine');
      }
    } catch (error: any) {
      impact('error');
      if (error.status === 409) {
        Alert.alert('Duplicate Routine', 'A routine collection with this name already exists. Please choose a different title.');
      } else {
        Alert.alert('Error', error.message || 'Failed to create routine collection');
      }
    } finally {
      setLoading(false);
    }
  };

  const SelectButton = ({ label, value, options, onSelect }: any) => (
    <View style={styles.selectGroup}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsContainer}>
        {options.map((opt: string) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.optionButton,
              { 
                backgroundColor: value === opt ? theme.accent : theme.surface,
                borderColor: value === opt ? theme.accent : theme.border,
                borderWidth: 1
              }
            ]}
            onPress={async () => {
              await impact('selection');
              onSelect(opt);
            }}
          >
            <Text style={[
              styles.optionText,
              { color: value === opt ? theme.cardText : theme.text }
            ]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={async () => { await impact('selection'); router.back(); }}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Create Collection</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.formSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.text }]}>Collection Title</Text>
          <TextInput
            style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
            placeholder="e.g., Summer Shred 2025"
            placeholderTextColor={theme.textMuted}
            value={formData.title}
            onChangeText={(text) => updateField('title', text)}
          />

          <Text style={[styles.label, { color: theme.text, marginTop: 16 }]}>Description</Text>
          <TextInput
            style={[styles.textArea, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
            placeholder="Describe your routine goal..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) => updateField('description', text)}
          />
        </View>

        <SelectButton 
          label="Difficulty Level" 
          value={formData.difficultyLevel} 
          options={DIFFICULTY_LEVELS} 
          onSelect={(val: string) => updateField('difficultyLevel', val)} 
        />

        <SelectButton 
          label="Equipment Type" 
          value={formData.equipmentType} 
          options={EQUIPMENT_TYPES} 
          onSelect={(val: string) => updateField('equipmentType', val)} 
        />

        <SelectButton 
          label="Workout Split" 
          value={formData.workoutSplit} 
          options={WORKOUT_SPLITS} 
          onSelect={(val: string) => updateField('workoutSplit', val)} 
        />

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButtonContainer}
          onPress={handleSave}
          disabled={loading}
        >
          <LinearGradient
            colors={[theme.accent, theme.accentSecondary]}
            locations={[0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color={theme.cardText} />
            ) : (
              <>
                <Save size={20} color={theme.cardText} />
                <Text style={[styles.saveButtonText, { color: theme.cardText }]}>Create Routine Collection</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  selectGroup: {
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButtonContainer: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
