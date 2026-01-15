import React from 'react';
import { View, Text, StyleSheet, Dimensions, useColorScheme, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getThemeColors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHaptics } from '@/hooks/useHaptics';

const { width } = Dimensions.get('window');

const slides = [
  { title: 'Welcome to Muscledia', subtitle: 'Gamify your workouts with XP and quests.' },
  { title: 'Build Custom Routines', subtitle: 'Pick exercises, add sets, and track completion.' },
  { title: 'Shop', subtitle: 'Customize your character.' },
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const router = useRouter();
  const { impact } = useHaptics();
  const [index, setIndex] = React.useState(0);

  const next = async () => {
    if (index < slides.length - 1) {
      setIndex(i => i + 1);
      await impact('selection');
    } else {
      await AsyncStorage.setItem('onboarding_complete', '1');
      await impact('success');
      router.replace('/(auth)/login');
    }
  };

  const skip = async () => {
    await AsyncStorage.setItem('onboarding_complete', '1');
    router.replace('/(auth)/login');
  };

  const slide = slides[index];

  return (
    <LinearGradient
      colors={[theme.accent, theme.accentSecondary]}
      locations={[0.55, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container]}
    >
      <View style={styles.contentWrap}>
        <Text style={[styles.title, { color: theme.cardText }]}>{slide.title}</Text>
        <Text style={[styles.subtitle, { color: theme.cardText }]}>{slide.subtitle}</Text>
      </View>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, { opacity: i === index ? 1 : 0.35, backgroundColor: theme.cardText }]} />
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={skip}>
          <Text style={[styles.actionText, { color: theme.cardText, opacity: 0.8 }]}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={next} activeOpacity={0.9}>
          <View style={[styles.nextBtn, { backgroundColor: theme.background }]}>
            <Text style={[styles.nextText, { color: theme.text }]}>{index < slides.length - 1 ? 'Next' : 'Get Started'}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 24 },
  contentWrap: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 24 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  actionText: { fontSize: 14 },
  nextBtn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  nextText: { fontWeight: '700' },
});


