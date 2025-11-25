import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCharacter } from '@/hooks/useCharacter';
import { useAuth } from '@/hooks/useAuth';
import ProgressBar from '@/components/ProgressBar';
import { Coins, Pen, Compass } from 'lucide-react-native';
import { getGreeting } from '@/utils/helpers';
import { useWorkouts } from '@/hooks/useWorkouts';
import { RoutineService } from '@/services';
import { RoutineFolder } from '@/types/api';
import { getThemeColors } from '@/constants/Colors';
import { useRouter, useFocusEffect } from 'expo-router';
import { useHaptics } from '@/hooks/useHaptics';

export default function HomeScreen() {
  const { character, incrementXP } = useCharacter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const [greeting, setGreeting] = useState('');
  const { workouts } = useWorkouts();
  
  // State for API-based routines
  const [routines, setRoutines] = useState<RoutineFolder[]>([]);
  const [routinesLoading, setRoutinesLoading] = useState(true);

  const router = useRouter();
  const { impact } = useHaptics();
  
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  // Fetch routines from API
  const fetchRoutines = async () => {
    try {
      setRoutinesLoading(true);
      const response = await RoutineService.getPersonalRoutineFolders();
      if (response.success && response.data) {
        setRoutines(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch routines on home screen:', error);
    } finally {
      setRoutinesLoading(false);
    }
  };

  // Helper to get start of week (Monday)
  function getStartOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  const startOfWeek = getStartOfWeek();
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const workoutsThisWeek = workouts.filter(w => {
    const workoutDate = new Date(w.timestamp);
    return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
  });

  const workoutsToShow = workouts;  //workoutsThisWeek; - to show only this week workouts; fix

  useEffect(() => {
    setGreeting(getGreeting());
    fetchRoutines(); // Initial fetch
  }, []);

  // Refresh routines when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchRoutines();
    }, [])
  );

  const RoutineCard = ({ routine }: { routine: RoutineFolder }) => (
    <TouchableOpacity 
      onPress={async () => { 
        await impact('selection'); 
        router.push({
          pathname: `/routine-detail/${routine.id}`,
          params: { routineData: JSON.stringify(routine) }
        });
      }}
      activeOpacity={0.9}
      style={styles.routineCardWrapper}
    >
      <LinearGradient
        colors={[theme.accent, theme.accentSecondary]}
        locations={[0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.routineCard}
      >
        <View style={styles.routineHeader}>
          <Text style={[styles.routineName, { color: theme.cardText }]} numberOfLines={1}>
            {routine.title || routine.name}
          </Text>
          <Text style={[styles.routineChevron, { color: theme.cardText }]}>›</Text>
        </View>
        <Text style={[styles.routineExercises, { color: theme.cardText }]} numberOfLines={2}>
          {routine.description || 'No description'}
        </Text>
        <View style={styles.routineChipsRow}>
          <View style={[styles.chip, { backgroundColor: 'rgba(0,0,0,0.15)' }]}>
            <Text style={[styles.chipText, { color: theme.cardText }]}>
              {routine.workoutPlanCount || 0} workouts
            </Text>
          </View>
          <View style={[styles.chip, { backgroundColor: 'rgba(0,0,0,0.15)' }]}>
            <Text style={[styles.chipText, { color: theme.cardText }]}>Tap to start</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header with coin display */}
      <View style={styles.header}>
        <Text style={[styles.appTitle, { color: theme.text }]}>Muscledia</Text>
        <View style={styles.coinContainer}>
          <Coins size={20} color={theme.accent} />
          <Text style={[styles.coinText, { color: theme.accent }]}>100</Text>
        </View>
      </View>

      {/* Character Section (sprite + bars) */}
      <View style={[styles.characterSection, { backgroundColor: theme.surface }]}>
      
        <View style={styles.characterImageContainer}>
          <TouchableOpacity
            onPress={async () => { await impact('selection'); router.push('/customize'); }}
            style={styles.customizeBtn}
            activeOpacity={0.9}
          >
            <View style={[styles.customizeBtnInner, { backgroundColor: theme.accent }]}>
              <Pen size={16} color={theme.cardText} />
            </View>
          </TouchableOpacity>
          {character.characterBackgroundUrl ? (
            <Image
              source={{ uri: character.characterBackgroundUrl }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
          ) : null}
          <Image
            source={require('../../assets/images/muscledia_guy.png')}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.barsContainer}>
          <View style={styles.barRow}>
            <Text style={[styles.barLeftLabel, { color: theme.text }]}>
              {character.currentHealth}/{character.maxHealth}
            </Text>
            <View style={{ flex: 1 }}>
              <ProgressBar 
                progress={Math.max(0, Math.min(1, character.currentHealth / character.maxHealth || 0))} 
                color={theme.health}
                height={10}
              />
            </View>
            <Text style={[styles.barRightLabel, { color: theme.textSecondary }]}>Health</Text>
          </View>
          <View style={styles.barRow}>
            <Text style={[styles.barLeftLabel, { color: theme.text }]}>
              {character.xp}/{character.xpToNextLevel}
            </Text>
            <View style={{ flex: 1 }}>
              <ProgressBar 
                progress={Math.max(0, Math.min(1, character.xp / character.xpToNextLevel || 0))} 
                color={theme.xp}
                height={10}
              />
            </View>
            <Text style={[styles.barRightLabel, { color: theme.textSecondary }]}>Level {character.level}</Text>
          </View>
        </View>
      </View>
      
      {/* My Routines Section */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>My Routines ({routines.length})</Text>
      
      {routines.length === 0 ? (
        <TouchableOpacity 
          style={[styles.goldenCard, { backgroundColor: theme.cardBackground }]}
          onPress={async () => { await impact('medium'); router.push('/routine-builder'); }}
        >
          <View style={styles.routineContent}>
            <Text style={[styles.routineTitle, { color: theme.cardText }]}>Create Your First Routine</Text>
            <Text style={[styles.routineDescription, { color: theme.cardText }]}>
              Tap to start building your custom workout routine
            </Text>
          </View>
          <Text style={[styles.routineArrow, { color: theme.cardText }]}>+</Text>
        </TouchableOpacity>
      ) : (
        routines.map((routine) => (
          <RoutineCard key={routine.id} routine={routine} />
        ))
      )}

      {/* Discover Public Routines Button */}
      <TouchableOpacity 
        style={styles.discoverButtonWrapper}
        onPress={async () => { await impact('medium'); router.push('/public-routines'); }}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[theme.surface, theme.surfaceLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.discoverButton}
        >
          <View style={styles.discoverContent}>
            <View style={[styles.iconCircle, { backgroundColor: theme.accent + '20' }]}>
              <Compass size={24} color={theme.accent} />
            </View>
            <View style={styles.discoverTextContainer}>
              <Text style={[styles.discoverTitle, { color: theme.text }]}>
                Discover Workout Programs
              </Text>
              <Text style={[styles.discoverSubtitle, { color: theme.textSecondary }]}>
                Browse pre-made routines from experts
              </Text>
            </View>
          </View>
          <Text style={[styles.discoverChevron, { color: theme.accent }]}>›</Text>
        </LinearGradient>
      </TouchableOpacity>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  characterSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  characterImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
      height: 468,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    opacity: 0.6,
  },
  characterImage: {
      width: 370,
      height: 392,
  },
  barsContainer: {
      width: '100%',
      marginTop: 8,
      alignItems: 'center',
  },
  barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      width: '100%',
      maxWidth: 420,
  },
  barLeftLabel: {
      width: 100,
    fontSize: 12,
    textAlign: 'left',
  },
  barRightLabel: {
      width: 60,
    fontSize: 12,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  characterHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  customizeBtn: { position: 'absolute', top: 12, right: 12, zIndex: 2 },
  customizeBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10 },
  customizeText: { fontSize: 11, fontWeight: '700' },
  routineCardWrapper: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  routineCard: {
    padding: 16,
    borderRadius: 16,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  routineName: {
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: '90%',
  },
  routineChevron: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  routineExercises: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  routineChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  goldenCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  routineContent: {
    flex: 1,
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  routineDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  routineSubtext: {
    fontSize: 11,
    opacity: 0.8,
  },
  routineArrow: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  discoverButtonWrapper: {
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  discoverContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  discoverTextContainer: {
    flex: 1,
  },
  discoverTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  discoverSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  discoverChevron: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});