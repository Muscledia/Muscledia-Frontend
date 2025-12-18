import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LeaderboardRow } from './LeaderboardRow';
import { Podium } from './Podium';
import { LeaderboardEntry, LeaderboardResponse } from '@/types/api';
import { EmptyState } from '@/components/ui/EmptyState';
import { Trophy } from 'lucide-react-native';

interface LeaderboardListProps {
  data: LeaderboardResponse | null;
  currentUserId: number | null;
  theme: any;
  refreshing: boolean;
  onRefresh: () => void;
}

export function LeaderboardList({
  data,
  currentUserId,
  theme,
  refreshing,
  onRefresh,
}: LeaderboardListProps) {
  if (!data) {
    return (
      <EmptyState
        icon={<Trophy size={64} color={theme.textMuted} />}
        title="No leaderboard data"
        message="Unable to load leaderboard at this time"
        theme={theme}
      />
    );
  }

  const { leaderboard, currentUser, totalUsers } = data.data;
  const topThree = leaderboard.slice(0, 3);
  const restOfList = leaderboard.slice(3);

  // Check if current user is in the top list
  const currentUserInTopList = data.data.currentUserInTopList;
  const shouldShowCurrentUserSeparately = !currentUserInTopList && currentUser;

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.accent}
          colors={[theme.accent]}
        />
      }
    >
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {totalUsers} {totalUsers === 1 ? 'Player' : 'Players'}
        </Text>
        {data.timestamp && (
          <Text style={[styles.timestamp, { color: theme.textMuted }]}>
            Updated {formatTimestamp(data.timestamp)}
          </Text>
        )}
      </View>

      {/* Podium for Top 3 */}
      {topThree.length > 0 && <Podium topThree={topThree} theme={theme} />}

      {/* Rest of the list */}
      {restOfList.length > 0 && (
        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Rankings
          </Text>
          {restOfList.map((entry) => (
            <LeaderboardRow
              key={entry.userId}
              entry={entry}
              isCurrentUser={currentUserId === entry.userId}
              theme={theme}
            />
          ))}
        </View>
      )}

      {/* Current User Position (if not in top list) */}
      {shouldShowCurrentUserSeparately && (
        <>
          <View style={styles.separator}>
            <View style={[styles.separatorLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.separatorText, { color: theme.textMuted }]}>
              Your Position
            </Text>
            <View style={[styles.separatorLine, { backgroundColor: theme.border }]} />
          </View>
          <LeaderboardRow
            entry={currentUser}
            isCurrentUser={true}
            theme={theme}
          />
        </>
      )}

      {/* Empty state if no entries */}
      {leaderboard.length === 0 && (
        <EmptyState
          icon={<Trophy size={64} color={theme.textMuted} />}
          title="No rankings yet"
          message="Be the first to earn points and climb the leaderboard!"
          theme={theme}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  listSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
  },
});
