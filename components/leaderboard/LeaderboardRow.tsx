import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RankDisplay } from './RankDisplay';
import { LeaderboardEntry } from '@/types';
import { Flame, Dumbbell, Award } from 'lucide-react-native';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  theme: any;
  onPress?: () => void;
}

export function LeaderboardRow({ entry, isCurrentUser, theme, onPress }: LeaderboardRowProps) {
  const formatPoints = (points: number) => {
    if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
    if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
    return points.toLocaleString();
  };

  const RowContent = (
    <View style={[
      styles.container,
      isCurrentUser && { backgroundColor: theme.accent + '20', borderColor: theme.accent, borderWidth: 2 }
    ]}>
      <View style={styles.rankContainer}>
        <RankDisplay rank={entry.rank} theme={theme} size="small" />
      </View>
      
      <View style={styles.userInfo}>
        <Text style={[styles.userId, { color: theme.text }]} numberOfLines={1}>
          {entry.displayName}
        </Text>
        <View style={styles.statsRow}>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            Lv {entry.level}
          </Text>
          {entry.currentStreak !== undefined && (
            <View style={styles.statItem}>
              <Flame size={14} color={theme.streak} />
              <Text style={[styles.statText, { color: theme.streak, marginLeft: 4 }]}>
                {entry.currentStreak}
              </Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Dumbbell size={14} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary, marginLeft: 4 }]}>
              {entry.totalWorkouts}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Award size={14} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary, marginLeft: 4 }]}>
              {entry.totalBadges}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.pointsContainer}>
        <Text style={[styles.pointsText, { color: theme.accent }]}>
          {formatPoints(entry.points)}
        </Text>
        <Text style={[styles.pointsLabel, { color: theme.textMuted }]}>pts</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {RowContent}
      </TouchableOpacity>
    );
  }

  return RowContent;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
