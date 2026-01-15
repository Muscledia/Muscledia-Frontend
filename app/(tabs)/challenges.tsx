import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { getThemeColors } from '@/constants/Colors';
import { InteractiveChallengeCard } from '@/components/challenges/InteractiveChallengeCard';
import { ActiveChallengeCard } from '@/components/challenges/ActiveChallengeCard';
import { CelebrationScreen } from '@/components/challenges/CelebrationScreen';
import { ChallengeCompletionModal } from '@/components/challenges/ChallengeCompletionModal';
import { Challenge, UserChallenge } from '@/types/gamification.types';
import { Trophy, Calendar } from 'lucide-react-native';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';

// Hooks
import { useDailyChallenges, useAcceptChallenge } from '@/hooks/useDailyChallenges';
import { useWeeklyChallenges } from '@/hooks/useWeeklyChallenges';
import { useActiveChallenges, useUpdateChallengeProgress } from '@/hooks/useActiveChallenges';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';

const { width } = Dimensions.get('window');

type TabType = 'daily' | 'weekly' | 'active';

// Unified type for list items to allow clear differentiation in the renderItem function
type ListItem =
  | { type: 'available'; data: Challenge }
  | { type: 'active'; data: UserChallenge };

export default function ChallengesScreen() {
  const colorScheme = useColorScheme();
  const theme = getThemeColors(colorScheme === 'dark');
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [refreshing, setRefreshing] = useState(false);

  const [celebrationData, setCelebrationData] = useState<{ visible: boolean; name: string; points: number } | null>(null);

  // Fetch Data using existing hooks
  const { data: dailyChallenges = [], isLoading: loadingDaily, refetch: refetchDaily } = useDailyChallenges();
  const { data: weeklyChallenges = [], isLoading: loadingWeekly, refetch: refetchWeekly } = useWeeklyChallenges();
  const { data: activeChallenges = [], isLoading: loadingActive, refetch: refetchActive } = useActiveChallenges();

  const { completionEvent, dismissCompletion } = useChallengeProgress();
  const acceptChallenge = useAcceptChallenge();
  const updateProgress = useUpdateChallengeProgress();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([refetchDaily(), refetchWeekly(), refetchActive()]).then(() => {
      setRefreshing(false);
    });
  }, [refetchDaily, refetchWeekly, refetchActive]);

  /**
   * Optimized Data Filtering
   * Uses the backend's UserChallengeDto signals (statusColor, progressPercentage)
   * to decide how to display active vs available challenges.
   */
  const filteredData = useMemo((): ListItem[] => {
    switch (activeTab) {
      case 'daily':
        return dailyChallenges
          // Filter out challenges that are already active
          .filter(c => !activeChallenges.some(a => a.challengeName === c.name))
          .map(c => ({ type: 'available', data: c }));
      case 'weekly':
        return weeklyChallenges
          .filter(c => !activeChallenges.some(a => a.challengeName === c.name))
          .map(c => ({ type: 'available', data: c }));
      case 'active':
        return activeChallenges
          // Only show those with an ACTIVE status
          .filter(a => a.status === 'ACTIVE')
          .map(a => ({ type: 'active', data: a }));
      default:
        return [];
    }
  }, [activeTab, dailyChallenges, weeklyChallenges, activeChallenges]);

  const handleUpdateProgress = useCallback((id: string, newProgress: number) => {
    updateProgress.mutate({ challengeId: id, progress: newProgress });
  }, [updateProgress]);

  const handleAccept = useCallback((id: string) => {
    acceptChallenge.mutate(id, {
      onSuccess: () => {
        Alert.alert(
          'Challenge Started!',
          'You can now track your progress in the Active tab.',
          [
            { text: 'Stay Here', style: 'cancel' },
            { text: 'View Progress', onPress: () => setActiveTab('active') }
          ]
        );
      },
      onError: (error: any) => {
        Alert.alert('Unable to start', error?.message || 'Please try again later.');
      }
    });
  }, [acceptChallenge]);

  const handleViewDetails = (id: string) => {
    // Logic for opening a challenge detail modal or screen
    console.log('Navigating to details for:', id);
  };

  const isLoading = loadingDaily || loadingWeekly || loadingActive;

  const renderContent = () => {
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
            {activeTab === 'active' ? 'No active goals right now.' : 'Check back later for new challenges.'}
          </Text>
          {activeTab === 'active' && (
            <TouchableOpacity onPress={() => setActiveTab('daily')}>
              <Text style={[styles.linkText, { color: theme.accent }]}>Browse available challenges</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <FlatList
        data={filteredData}
        keyExtractor={(item) => (item.type === 'available' ? item.data.id : item.data.challengeName)}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInRight.delay(index * 50).springify()}
            layout={Layout.springify()}
            style={styles.cardWrapper}
          >
            {item.type === 'active' ? (
              <ActiveChallengeCard
                userChallenge={item.data}
                theme={theme}
              />
            ) : (
              <InteractiveChallengeCard
                challenge={item.data}
                state="available"
                onAccept={() => handleAccept(item.data.id)}
                onViewDetails={() => handleViewDetails(item.data.id)}
              />
            )}
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Challenges</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Earn rewards by pushing your fitness boundaries.
        </Text>
      </View>

      <View style={styles.tabs}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {(['daily', 'weekly', 'active'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: theme.accent + '20', borderColor: theme.accent }
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <View style={styles.tabItemInner}>
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
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 14, opacity: 0.8 },
  tabs: { marginBottom: 20 },
  tabScrollContent: { paddingHorizontal: 20, gap: 12 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: 'transparent', backgroundColor: 'rgba(0,0,0,0.05)' },
  tabItemInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabText: { fontWeight: '600', fontSize: 14 },
  content: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 40 },
  cardWrapper: { marginBottom: 16, width: '100%' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, marginTop: 16, textAlign: 'center' },
  linkText: { marginTop: 8, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
