import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { useDailyChallenges, useAcceptChallenge } from '@/hooks/useDailyChallenges';
import { ChallengeCard } from './ChallengeCard';
import { Colors, getThemeColors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { useCharacter } from '@/hooks/useCharacter';
import { JourneyPhase } from '@/types';
import { Flag, Shield, Crown } from 'lucide-react-native';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const JourneyPhaseIndicator = ({ level }: { level: number }) => {
  const colorScheme = useColorScheme();
  const theme = getThemeColors(colorScheme === 'dark');

  let phase: JourneyPhase = 'Foundation';
  let Icon = Flag;
  let color = '#4CAF50';
  let progress = 0;

  if (level < 30) {
    phase = 'Foundation';
    Icon = Flag;
    color = '#4CAF50';
    progress = level / 30;
  } else if (level < 50) {
    phase = 'Building';
    Icon = Shield;
    color = '#FFD700';
    progress = (level - 30) / 20;
  } else if (level < 80) {
    phase = 'Advanced';
    Icon = Shield; // Reuse or new icon
    color = '#FFA000';
    progress = (level - 50) / 30;
  } else if (level < 120) {
    phase = 'Elite';
    Icon = Crown;
    color = '#FF5722';
    progress = (level - 80) / 40;
  } else {
    phase = 'Mastery';
    Icon = Crown;
    color = '#F44336';
    progress = Math.min(1, (level - 120) / 60); // Cap at 180 roughly
  }

  return (
    <View style={[styles.phaseContainer, { backgroundColor: theme.surface }]}>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.phaseInfo}>
        <Text style={[styles.phaseLabel, { color: theme.textSecondary }]}>Current Phase</Text>
        <Text style={[styles.phaseTitle, { color: theme.text }]}>{phase}</Text>
      </View>
      <View style={styles.phaseProgress}>
        <View style={[styles.progressBarBg, { backgroundColor: theme.surfaceLight }]}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
        </View>
        <Text style={[styles.phaseLevel, { color: theme.textSecondary }]}>Lvl {level}</Text>
      </View>
    </View>
  );
};

export const DailyChallenges = () => {
  const { data: challenges, isLoading, refetch, isRefetching } = useDailyChallenges();
  const { mutate: acceptChallenge } = useAcceptChallenge();
  const { character } = useCharacter();
  const colorScheme = useColorScheme();
  const theme = getThemeColors(colorScheme === 'dark');
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const onRefresh = useCallback(() => {
    refetch();
    setHiddenIds(new Set()); // Reset hidden on refresh
  }, [refetch]);

  const handleAccept = useCallback((id: string) => {
    console.log('Accepted challenge', id);
    acceptChallenge(id, {
      onSuccess: () => {
        Alert.alert('Challenge Accepted', 'Good luck!');
        setHiddenIds(prev => new Set(prev).add(id));
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message || 'Failed to accept challenge');
      }
    });
  }, [acceptChallenge]);

  const handleDismiss = useCallback((id: string) => {
    console.log('Dismissed challenge', id);
    setHiddenIds(prev => new Set(prev).add(id));
  }, []);

  const visibleChallenges = challenges?.filter(c => !hiddenIds.has(c.id)) || [];

  if (isLoading && !challenges) {
    return (
        <View style={[styles.loadingContainer, {height: 200}]}>
             <Text style={{color: theme.textSecondary}}>Loading challenges...</Text>
        </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Challenges</Text>
        <JourneyPhaseIndicator level={character.level} />
      </View>
      
      {visibleChallenges.length > 0 ? (
        <FlatList
          horizontal
          data={visibleChallenges}
          renderItem={({ item, index }) => (
            <Animated.View 
                entering={FadeInRight.delay(index * 100).springify()} 
                layout={Layout.springify()}
            >
              <ChallengeCard
                challenge={item}
                onAccept={handleAccept}
                onDismiss={handleDismiss}
              />
            </Animated.View>
          )}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          snapToInterval={width * 0.75 + 16} // card width + margin
          decelerationRate="fast"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={theme.accent} />
          }
        />
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No more challenges for today!
          </Text>
          <TouchableOpacity onPress={onRefresh}>
             <Text style={{color: theme.accent, marginTop: 8}}>Check for new</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  phaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseInfo: {
    flex: 1,
  },
  phaseLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phaseProgress: {
    alignItems: 'flex-end',
    width: 80,
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  phaseLevel: {
    fontSize: 10,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20, // Space for shadows
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    marginHorizontal: 16,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  }
});
