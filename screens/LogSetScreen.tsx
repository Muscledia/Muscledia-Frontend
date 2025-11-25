import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { SetTypeSelector } from '@/components/SetTypeSelector';
import { SetType } from '@/types/workout.types';
import { getThemeColors } from '@/constants/Colors';

export default function LogSetScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState('');
  const [rest, setRest] = useState('');
  const [setType, setSetType] = useState<SetType>(SetType.NORMAL);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    // Validate inputs
    if (!weight || !reps) {
      Alert.alert('Missing Data', 'Please enter weight and reps');
      return;
    }

    const payload = {
      weight: parseFloat(weight),
      reps: parseFloat(reps),
      rpe: rpe ? parseFloat(rpe) : undefined,
      rest: rest ? parseFloat(rest) : undefined,
      setType,
      notes,
    };

    console.log('Submitting set:', payload);

    // TODO: Connect to actual API or Context
    
    Alert.alert('Set Logged', 'Your set has been logged successfully', [
      { text: 'OK', onPress: () => {
        // Clear form
        setWeight('');
        setReps('');
        setRpe('');
        setRest('');
        setSetType(SetType.NORMAL);
        setNotes('');
      }}
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.form}>
        <Text style={[styles.label, { color: theme.text }]}>Weight (kg)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={[styles.label, { color: theme.text }]}>Reps</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          value={reps}
          onChangeText={setReps}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={[styles.label, { color: theme.text }]}>RPE (1-10)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          value={rpe}
          onChangeText={setRpe}
          keyboardType="numeric"
          placeholder="Optional"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={[styles.label, { color: theme.text }]}>Rest (seconds)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          value={rest}
          onChangeText={setRest}
          keyboardType="numeric"
          placeholder="Optional"
          placeholderTextColor={theme.textSecondary}
        />

        {/* Set Type Selector */}
        <SetTypeSelector value={setType} onChange={setSetType} />

        <Text style={[styles.label, { color: theme.text, marginTop: 16 }]}>Notes</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, height: 80, textAlignVertical: 'top' }]}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Add notes..."
          placeholderTextColor={theme.textSecondary}
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSave}>
          <Text style={styles.buttonText}>Log Set</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


