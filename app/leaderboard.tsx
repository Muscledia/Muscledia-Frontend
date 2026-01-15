import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getThemeColors } from '@/constants/Colors';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardList } from '@/components/leaderboard';
import { useAuth } from '@/hooks/useAuth';
import { LeaderboardType } from '@/types';
import { ArrowLeft, Trophy, Flame } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHaptics } from '@/hooks/useHaptics';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

type TabType = 'POINTS' | 'LEVELS' | 'WEEKLY_STREAK';

const TABS: { type: TabType; label: string }[] = [
  { type: 'POINTS', label: 'Points' },
  { type: 'LEVELS', label: 'Levels' },
  { type: 'WEEKLY_STREAK', label: 'Streak' },
];

export default function LeaderboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const insets = useSafeAreaInsets();
  const { impact } = useHaptics();
  const { user, loginData } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('POINTS');
  const { data, loading, error, refreshing, refresh, currentUserEntry } = useLeaderboard(activeTab);

  const currentUserId = loginData?.userId ? parseInt(loginData.userId) : user?.id || null;

  const handleTabChange = async (tab: TabType) => {
    await impact('light');
    setActiveTab(tab);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(16, (insets?.top || 0) + 8) }]}>
        <TouchableOpacity
          onPress={async () => {
            await impact('selection');
            router.back();
          }}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Trophy size={24} color={theme.accent} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Leaderboard</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.surface }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.type;
          return (
            <TouchableOpacity
              key={tab.type}
              onPress={() => handleTabChange(tab.type)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              {isActive ? (
                <LinearGradient
                  colors={[theme.accent, theme.accentSecondary]}
                  locations={[0.55, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabGradient}
                >
                  <Text style={[styles.tabText, { color: theme.cardText }]}>
                    {tab.label}
                  </Text>
                </LinearGradient>
              ) : (
                <Text style={[styles.tabText, { color: theme.textSecondary }]}>
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Current User Card (if available) */}
      {currentUserEntry && (
        <View style={[styles.currentUserCard, { backgroundColor: theme.surface }]}>
          <View style={styles.currentUserInfo}>
            <Text style={[styles.currentUserLabel, { color: theme.textSecondary }]}>
              Your Rank
            </Text>
            <Text style={[styles.currentUserRank, { color: theme.accent }]}>
              #{currentUserEntry.rank}
            </Text>
          </View>
          <View style={styles.currentUserStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {currentUserEntry.points.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                Lv {currentUserEntry.level}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Level</Text>
            </View>
            {currentUserEntry.currentStreak !== undefined && (
              <View style={styles.statItem}>
                <View style={styles.streakContainer}>
                  <Flame size={18} color={theme.streak} />
                  <Text style={[styles.statValue, { color: theme.streak, marginLeft: 4 }]}>
                    {currentUserEntry.currentStreak}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Streak</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Content */}
      {loading && !data ? (
        <LoadingScreen message="Loading leaderboard..." theme={theme} />
      ) : error ? (
        <ErrorState error={error} onRetry={refresh} theme={theme} />
      ) : (
        <LeaderboardList
          data={data}
          currentUserId={currentUserId}
          theme={theme}
          refreshing={refreshing}
          onRefresh={refresh}
        />
      )}
    </View>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  currentUserCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  currentUserInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentUserLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentUserRank: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  currentUserStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
});
