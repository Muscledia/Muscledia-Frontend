import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, User, Calendar } from 'lucide-react-native';
import { AuthService } from '@/services/authService';
import { RegisterRequest } from '@/types/api';
import { Colors, getThemeColors } from '@/constants/Colors';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [heightText, setHeightText] = useState('');
  const [initialWeightText, setInitialWeightText] = useState('');
  const [goalType, setGoalType] = useState<RegisterRequest['goalType'] | ''>('');
  const [showGoalTypeOptions, setShowGoalTypeOptions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  const handleRegister = async () => {
    if (isLoading) return;

    // Validation
    if (!username.trim() || !email.trim() || !password || !confirmPassword || !birthDate.trim() || !gender || !heightText.trim() || !initialWeightText.trim() || !goalType) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    // Birth date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate.trim())) {
      Alert.alert('Error', 'Birth date must be in YYYY-MM-DD format.');
      return;
    }

    // Numeric validations and length limits
    const heightSanitized = heightText.replace(/[^0-9]/g, '');
    const weightSanitized = initialWeightText.replace(/[^0-9]/g, '');
    if (heightSanitized.length === 0 || weightSanitized.length === 0) {
      Alert.alert('Error', 'Height and Initial Weight must be numeric.');
      return;
    }
    if (heightSanitized.length > 5 || weightSanitized.length > 5) {
      Alert.alert('Error', 'Height and Initial Weight cannot exceed 5 digits.');
      return;
    }
    const height = parseInt(heightSanitized, 10);
    const initialWeight = parseInt(weightSanitized, 10);
    if (!Number.isFinite(height) || height <= 0 || !Number.isFinite(initialWeight) || initialWeight <= 0) {
      Alert.alert('Error', 'Height and Initial Weight must be positive numbers.');
      return;
    }

    setIsLoading(true);
    try {
      const payload: RegisterRequest = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        birthDate: birthDate.trim(),
        gender,
        height,
        initialWeight,
        goalType: goalType as RegisterRequest['goalType'],
      };

      await AuthService.register(payload);

      Alert.alert(
        'Success!', 
        'Your account has been created successfully. Please sign in.',
        [{ text: 'Go to Login', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      const message = error?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/(auth)/login');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
    }

    if (event.type === 'dismissed') {
        return;
    }

    if (selectedDate) {
        setDate(selectedDate);
        // Format to YYYY-MM-DD
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        setBirthDate(`${year}-${month}-${day}`);
    }
  };

  return (
    <LinearGradient
      colors={isDark ? [theme.background, theme.surface] : [theme.surface, theme.background]}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.content}>
          {/* Logo/Title */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.accent }]}>Join Muscledia</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Start your fitness adventure today
            </Text>
          </View>

          {/* Register Form */}
          <View style={[styles.form, { backgroundColor: theme.surface }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>Create Account</Text>
            
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Username</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
                <User size={20} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Choose a username"
                  placeholderTextColor={theme.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Email</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
                <Mail size={20} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Birth Date Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Birth Date</Text>
              <TouchableOpacity
                style={[styles.inputWrapper, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}
                onPress={() => setShowDatePicker(!showDatePicker)}
              >
                <Calendar size={20} color={theme.textMuted} style={styles.inputIcon} />
                <Text style={[styles.input, { color: birthDate ? theme.text : theme.textMuted, height: undefined }]}>
                    {birthDate || 'YYYY-MM-DD'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    textColor={theme.text}
                />
              )}
            </View>

            {/* Gender Selector */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Gender</Text>
              <View style={styles.chipRow}>
                {(['Male','Female','Other'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.chip, { borderColor: theme.border, backgroundColor: gender === g ? theme.accent : theme.surfaceLight }]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.chipText, { color: gender === g ? '#FFFFFF' : theme.text }]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Height Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Height (cm)</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="e.g., 180"
                  placeholderTextColor={theme.textMuted}
                  value={heightText}
                  onChangeText={(t) => setHeightText(t.replace(/[^0-9]/g, '').slice(0, 5))}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
            </View>

            {/* Initial Weight Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Initial Weight (kg)</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="e.g., 75"
                  placeholderTextColor={theme.textMuted}
                  value={initialWeightText}
                  onChangeText={(t) => setInitialWeightText(t.replace(/[^0-9]/g, '').slice(0, 5))}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
            </View>

            {/* Goal Type Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Goal</Text>
              <TouchableOpacity
                style={[styles.inputWrapper, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}
                onPress={() => setShowGoalTypeOptions((s) => !s)}
                activeOpacity={0.8}
              >
                <Text style={{ color: goalType ? theme.text : theme.textMuted, fontSize: 16 }}>
                  {goalType || 'Select your goal'}
                </Text>
              </TouchableOpacity>
              {showGoalTypeOptions && (
                <View style={[styles.dropdownContainer, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
                  {(['LOSE_WEIGHT','BUILD_STRENGTH','GAIN_MUSCLE'] as const).map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.dropdownOption}
                      onPress={() => { setGoalType(opt); setShowGoalTypeOptions(false); }}
                    >
                      <Text style={{ color: theme.text, fontSize: 16 }}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
                <Lock size={20} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Create a password"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={theme.textMuted} />
                  ) : (
                    <Eye size={20} color={theme.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={[styles.passwordHint, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Minimum 6 characters
              </Text>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
                <Lock size={20} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={theme.textMuted} />
                  ) : (
                    <Eye size={20} color={theme.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, { opacity: isLoading ? 0.7 : 1, backgroundColor: theme.accent }]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: theme.textSecondary }]}> 
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={[styles.loginLink, { color: theme.accent }]}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },
  passwordHint: {
    fontSize: 12,
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: '#6D28D9',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    color: '#6D28D9',
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)'
  },
}); 