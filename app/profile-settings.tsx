import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getThemeColors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileSettingsScreen() {
  const { user, updateName, updateEmail, changePassword } = useAuth();
  // Always use dark mode
  const theme = getThemeColors();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const onSaveProfile = async () => {
    setSaving(true);
    try {
      const nameRes = await updateName(name);
      if (!nameRes.success) return Alert.alert('Update failed', nameRes.error || 'Invalid name');
      const emailRes = await updateEmail(email);
      if (!emailRes.success) return Alert.alert('Update failed', emailRes.error || 'Invalid email');
      Alert.alert('Profile updated', 'Your profile details were saved.');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    setSaving(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (!res.success) return Alert.alert('Password not changed', res.error || 'Try again');
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Password updated', 'Your password was changed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}> 
      <View style={styles.header}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={[styles.backText, { color: theme.text }]}>{'‹ Back'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Profile Settings</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface }]}> 
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />
        <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />
        <TouchableOpacity style={[styles.button]} onPress={onSaveProfile} disabled={saving}>
          <Text style={[styles.buttonText, { color: theme.cardText }]}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface }]}> 
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Change Password</Text>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Current Password</Text>
        <TextInput
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Current password"
          secureTextEntry
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />
        <Text style={[styles.label, { color: theme.textSecondary }]}>New Password</Text>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New password (min 6 chars)"
          secureTextEntry
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />
        <TouchableOpacity style={[styles.button]} onPress={onChangePassword} disabled={saving}>
          <Text style={[styles.buttonText, { color: theme.cardText }]}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backButton: { paddingVertical: 8, paddingHorizontal: 4 },
  backText: { fontSize: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  card: { borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 12, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6 },
  button: { backgroundColor: '#FFD700', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  buttonText: { fontWeight: '700' },
});


