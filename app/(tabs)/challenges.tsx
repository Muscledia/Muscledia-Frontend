import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { getThemeColors } from '@/constants/Colors';
import { InteractiveChallengeCard, ChallengeCardState } from '@/components/challenges/InteractiveChallengeCard';
import { ActiveChallengeCard } from '@/components/challenges/ActiveChallengeCard';
import { CelebrationScreen } from '@/components/challenges/CelebrationScreen';
import { ChallengeCompletionModal } from '@/components/challenges/ChallengeCompletionModal';
import { DUMMY_JOURNEY_NODES } from '@/data/dummyJourney';
import { JourneyMap } from '@/components/journey/JourneyMap';
import { Challenge, ActiveChallenge } from '@/types';
import { Trophy, Calendar, Map as MapIcon } from 'lucide-react-native';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';

// Hooks
import { useDailyChallenges, useAcceptChallenge } from '@/hooks/useDailyChallenges';
import { useWeeklyChallenges } from '@/hooks/useWeeklyChallenges';
import { useActiveChallenges, useUpdateChallengeProgress } from '@/hooks/useActiveChallenges';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';

const { width } = Dimensions.get('window');

type TabType = 'daily' | 'weekly' | 'active' | 'journey';

export default function ChallengesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [refreshing, setRefreshing] = useState(false);
  
  // Local state for journey (still dummy for now)
  const [journeyNodes, setJourneyNodes] = useState(DUMMY_JOURNEY_NODES);
  
  // Celebration state
  const [celebrationData, setCelebrationData] = useState<{ visible: boolean; name: string; points: number } | null>(null);

  // Fetch Data
  const { data: dailyChallenges = [], isLoading: loadingDaily, refetch: refetchDaily } = useDailyChallenges();
  const { data: weeklyChallenges = [], isLoading: loadingWeekly, refetch: refetchWeekly } = useWeeklyChallenges();
  const { data: activeChallenges = [], isLoading: loadingActive, refetch: refetchActive } = useActiveChallenges();
  
  // Use challenge progress hook for completion detection
  const { challenges, completionEvent, dismissCompletion } = useChallengeProgress();
  
  const acceptChallenge = useAcceptChallenge();
  const updateProgress = useUpdateChallengeProgress();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([refetchDaily(), refetchWeekly(), refetchActive()]).then(() => {
      setRefreshing(false);
    });
  }, [refetchDaily, refetchWeekly, refetchActive]);

  // Combine data for display
  const getFilteredData = useMemo(() => {
    // Helper to check status of a challenge
    const getChallengeStatus = (challengeId: string): { state: ChallengeCardState, currentProgress: number } => {
      const active = activeChallenges.find(a => a.challengeId === challengeId);
      if (active) {
        if (active.status === 'COMPLETED') return { state: 'completed', currentProgress: active.targetValue };
        return { state: 'active', currentProgress: active.currentProgress };
      }
      return { state: 'available', currentProgress: 0 };
    };

    switch (activeTab) {
      case 'daily':
        return dailyChallenges
          .map(c => {
            const status = getChallengeStatus(c.id);
            return { challenge: c, ...status };
          })
          .filter(item => item.challenge.type === 'DAILY' && item.state !== 'completed'); // Filter out completed?
      case 'weekly':
        return weeklyChallenges
          .map(c => {
            const status = getChallengeStatus(c.id);
            return { challenge: c, ...status };
          })
          // Filter by type if needed, but endpoint already does it
          .filter(item => item.state !== 'completed');
      case 'active':
        // For active tab, we map ActiveChallenge to the structure expected
        return activeChallenges
          .filter(a => a.status === 'ACTIVE')
          .map(a => {
            // Find the challenge type by looking up in daily/weekly challenges
            const foundChallenge = [...dailyChallenges, ...weeklyChallenges].find(
              c => c.id === a.challengeId
            );
            const challengeType = foundChallenge?.type || 'DAILY'; // Default to DAILY if not found
            
            // Construct a Challenge object from ActiveChallenge
            // Use foundChallenge if available, otherwise create minimal Challenge from ActiveChallenge
            const challenge: Challenge = foundChallenge ? {
              ...foundChallenge,
              currentProgress: a.currentProgress,
              completionPercentage: a.progressPercentage,
              timeRemaining: a.timeRemaining,
            } : {
              id: a.challengeId,
              name: a.challengeName,
              description: 'Complete the objective to earn rewards!',
              type: challengeType,
              category: null,
              difficultyLevel: 'INTERMEDIATE',
              journeyTags: [],
              journeyPhase: 'foundation',
              targetValue: a.targetValue,
              progressUnit: a.progressUnit,
              currentProgress: a.currentProgress,
              completionPercentage: a.progressPercentage,
              timeRemaining: a.timeRemaining,
              rewardPoints: a.pointsEarned || 0,
              rewardCoins: 0,
              experiencePoints: 0,
              isMilestone: false,
              isLegendary: false,
              completionMessage: 'Great job completing this challenge!',
              exerciseFocus: [],
              safetyNote: null,
              tips: [],
              prerequisites: [],
              unlocks: [],
            };
            return {
              challenge,
              state: 'active' as ChallengeCardState,
              currentProgress: a.currentProgress
            };
          });
      default:
        return [];
    }
  }, [activeTab, dailyChallenges, weeklyChallenges, activeChallenges]);

  const handleUpdateProgress = useCallback((id: string, newProgress: number) => {
    // Optimistic update could happen here, but we use mutation
    updateProgress.mutate({ challengeId: id, progress: newProgress }, {
      onSuccess: () => {
         // Check if completed - strictly we should check backend response
         // For now, let react-query invalidate and refresh
      }
    });
  }, [updateProgress]);

  const handleAccept = useCallback((id: string) => {
     acceptChallenge.mutate(id, {
       onSuccess: () => {
         Alert.alert(
           'Challenge Accepted', 
           'Go crush it! You can find this in your Active tab.',
           [
             { text: 'Stay Here', style: 'cancel' },
             { text: 'Go to Active', onPress: () => setActiveTab('active') }
           ]
         );
       },
      onError: (error: any) => {
        if (error?.message?.includes('already in progress')) {
          Alert.alert(
            'Already Active',
            'You have already started this challenge! Check your Active tab.',
            [
              { text: 'Stay Here', style: 'cancel' },
              { text: 'Go to Active', onPress: () => setActiveTab('active') }
            ]
          );
          return;
        }
        Alert.alert('Error', 'Failed to accept challenge. Please try again.');
        console.error(error);
      }
     });
  }, [acceptChallenge]);

  const handleAbandon = useCallback((id: string) => {
    Alert.alert(
      'Abandon Challenge',
      'Abandoning challenges is not yet supported by the server.',
      [{ text: 'OK' }]
    );
  }, []);

  const handleViewDetails = useCallback((id: string) => {
    console.log('View details', id);
    // TODO: Implement details modal
  }, []);

  const filteredData = getFilteredData;
  const isLoading = loadingDaily || loadingWeekly || loadingActive;

  const renderContent = () => {
    if (activeTab === 'journey') {
        return (
            <JourneyMap 
                nodes={journeyNodes} 
                activeJourneyType="general-fitness"
                onNodePress={(node) => {
                    Alert.alert(node.title, `Status: ${node.status}\n${node.phase} Phase`);
                }}
            />
        );
    }

    if (isLoading && !refreshing && filteredData.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      );
    }

    if (filteredData.length === 0) {
       return (
          <View style={styles.emptyState}>
             {activeTab === 'active' ? (
                <Trophy size={48} color={theme.textMuted} />
             ) : (
                <Calendar size={48} color={theme.textMuted} />
             )}
             <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
               {activeTab === 'active' ? 'No active challenges.' : 'No challenges available.'}
             </Text>
             {activeTab === 'active' && (
               <TouchableOpacity onPress={() => setActiveTab('daily')}>
                 <Text style={[styles.linkText, { color: theme.accent }]}>Find some challenges!</Text>
               </TouchableOpacity>
             )}
          </View>
        );
    }

    return (
      <FlatList
        data={filteredData}
        renderItem={({ item, index }) => (
            <Animated.View 
                entering={FadeInRight.delay(index * 100).springify()} 
                layout={Layout.springify()}
                style={styles.cardWrapper}
            >
                {activeTab === 'active' ? (
                    <ActiveChallengeCard
                        challenge={item.challenge}
                        initialProgress={item.currentProgress}
                        onUpdate={handleUpdateProgress}
                        onAbandon={handleAbandon}
                        onViewDetails={handleViewDetails}
                    />
                ) : (
                    <InteractiveChallengeCard
                        challenge={item.challenge}
                        state={item.state}
                        currentProgress={item.currentProgress}
                        onAccept={() => handleAccept(item.challenge.id)}
                        onViewDetails={() => handleViewDetails(item.challenge.id)}
                        onAbandon={() => handleAbandon(item.challenge.id)}
                        progressRealtime={true}
                    />
                )}
            </Animated.View>
        )}
        keyExtractor={(item) => item.challenge.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Challenges</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Push your limits, earn rewards.</Text>
      </View>

      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
            {(['daily', 'weekly', 'active', 'journey'] as TabType[]).map((tab) => (
            <TouchableOpacity
                key={tab}
                style={[
                styles.tab,
                activeTab === tab && { backgroundColor: theme.accent + '20', borderColor: theme.accent }
                ]}
                onPress={() => setActiveTab(tab)}
            >
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    {tab === 'journey' && <MapIcon size={14} color={activeTab === 'journey' ? theme.accent : theme.textSecondary} />}
                    <Text
                    style={[
                        styles.tabText,
                        { color: activeTab === tab ? theme.accent : theme.textSecondary }
                    ]}
                    >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                </View>
            </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>

      {celebrationData && (
        <CelebrationScreen
          visible={celebrationData.visible}
          data={{
            challengeName: celebrationData.name,
            pointsEarned: celebrationData.points,
          }}
          onClose={() => setCelebrationData(null)}
        />
      )}

      {/* Challenge Completion Modal */}
      {completionEvent && (
        <ChallengeCompletionModal
          visible={!!completionEvent}
          challengeName={completionEvent.challengeName}
          pointsEarned={completionEvent.pointsEarned}
          onClose={dismissCompletion}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  tabs: {
    marginBottom: 20,
  },
  tabScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  cardWrapper: {
      marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  linkText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
