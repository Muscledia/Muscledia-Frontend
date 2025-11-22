import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { useDailyChallenges, useAcceptChallenge } from '@/hooks/useDailyChallenges';
import { useWeeklyChallenges } from '@/hooks/useWeeklyChallenges';
import { useActiveChallenges } from '@/hooks/useActiveChallenges';
import { Challenge, ActiveChallenge } from '@/types/api';
import { Trophy, Calendar, Zap, Clock } from 'lucide-react-native';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type TabType = 'daily' | 'weekly' | 'active';

export default function ChallengesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const [activeTab, setActiveTab] = useState<TabType>('daily');

  const { data: dailyChallenges, isLoading: loadingDaily, refetch: refetchDaily, isRefetching: refetchingDaily } = useDailyChallenges();
  const { data: weeklyChallenges, isLoading: loadingWeekly, refetch: refetchWeekly, isRefetching: refetchingWeekly } = useWeeklyChallenges();
  const { data: activeChallenges, isLoading: loadingActive, refetch: refetchActive, isRefetching: refetchingActive } = useActiveChallenges();
  const { mutate: acceptChallenge } = useAcceptChallenge();

  const handleAccept = useCallback((id: string) => {
    acceptChallenge(id, {
      onSuccess: () => {
        Alert.alert('Challenge Accepted', 'Go crush it!');
        // Ideally we switch to active tab or show some feedback
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message || 'Failed to accept challenge');
      }
    });
  }, [acceptChallenge]);

  const handleDismiss = useCallback((id: string) => {
    // Just log for now
    console.log('Dismissed', id);
  }, []);

  const onRefresh = useCallback(() => {
    if (activeTab === 'daily') refetchDaily();
    else if (activeTab === 'weekly') refetchWeekly();
    else refetchActive();
  }, [activeTab, refetchDaily, refetchWeekly, refetchActive]);

  const isLoading = activeTab === 'daily' ? loadingDaily : activeTab === 'weekly' ? loadingWeekly : loadingActive;
  const isRefetching = activeTab === 'daily' ? refetchingDaily : activeTab === 'weekly' ? refetchingWeekly : refetchingActive;

  const renderActiveChallenge = ({ item, index }: { item: ActiveChallenge; index: number }) => (
    <Animated.View 
      entering={FadeInRight.delay(index * 100).springify()} 
      layout={Layout.springify()}
      style={[styles.activeCard, { backgroundColor: theme.surface }]}
    >
      <View style={styles.activeHeader}>
        <View style={styles.activeTitleRow}>
          <Trophy size={20} color={theme.accent} />
          <Text style={[styles.activeTitle, { color: theme.text }]}>{item.challengeName}</Text>
        </View>
        <Text style={[styles.activeStatus, { color: theme.accent }]}>{item.status}</Text>
      </View>
      
      <Text style={[styles.activeProgressText, { color: theme.textSecondary }]}>
        {item.formattedProgress}
      </Text>
      
      <View style={[styles.progressBarBg, { backgroundColor: theme.surfaceLight }]}>
        <View 
          style={[
            styles.progressBarFill, 
            { 
              width: `${Math.min(item.progressPercentage * 100, 100)}%`, 
              backgroundColor: theme.accent 
            }
          ]} 
        />
      </View>
      
      <View style={styles.activeFooter}>
        <View style={styles.footerItem}>
          <Clock size={14} color={theme.textMuted} />
          <Text style={[styles.footerText, { color: theme.textMuted }]}>{item.timeRemaining}</Text>
        </View>
        <View style={styles.footerItem}>
          <Zap size={14} color={theme.xp} />
          <Text style={[styles.footerText, { color: theme.xp }]}>{item.pointsEarned} XP Earned</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderContent = () => {
    if (activeTab === 'active') {
      if (activeChallenges?.length === 0 && !isLoading) {
        return (
          <View style={styles.emptyState}>
             <Trophy size={48} color={theme.textMuted} />
             <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No active challenges.</Text>
             <TouchableOpacity onPress={() => setActiveTab('daily')}>
               <Text style={[styles.linkText, { color: theme.accent }]}>Find some challenges!</Text>
             </TouchableOpacity>
          </View>
        );
      }
      return (
        <FlatList
          data={activeChallenges}
          renderItem={renderActiveChallenge}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={theme.accent} />}
        />
      );
    }

    const challenges = activeTab === 'daily' ? dailyChallenges : weeklyChallenges;
    
    if (challenges?.length === 0 && !isLoading) {
       return (
          <View style={styles.emptyState}>
             <Calendar size={48} color={theme.textMuted} />
             <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No challenges available.</Text>
          </View>
        );
    }

    return (
      <FlatList
        horizontal
        data={challenges}
        renderItem={({ item, index }) => (
            <Animated.View 
                entering={FadeInRight.delay(index * 100).springify()} 
                layout={Layout.springify()}
                style={styles.cardWrapper}
            >
                <ChallengeCard
                    challenge={item}
                    onAccept={handleAccept}
                    onDismiss={handleDismiss}
                />
            </Animated.View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.horizontalListContent}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width * 0.75 + 16}
        decelerationRate="fast"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={theme.accent} />}
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
        {(['daily', 'weekly', 'active'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: theme.accent + '20', borderColor: theme.accent }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? theme.accent : theme.textSecondary }
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
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
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
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
    gap: 16,
  },
  horizontalListContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardWrapper: {
      marginRight: 0, 
  },
  activeCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeProgressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  activeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
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
  }
});

