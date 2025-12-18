import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RankDisplay } from './RankDisplay';
import { LeaderboardEntry } from '@/types/api';

interface PodiumProps {
  topThree: LeaderboardEntry[];
  theme: any;
}

export function Podium({ topThree, theme }: PodiumProps) {
  // Ensure we have exactly 3 entries, pad with nulls if needed
  const entries = [
    topThree[0] || null,
    topThree[1] || null,
    topThree[2] || null,
  ];

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [entries[1], entries[0], entries[2]];

  const getPodiumHeight = (rank: number | null) => {
    if (!rank) return 60;
    if (rank === 1) return 100;
    if (rank === 2) return 80;
    return 70;
  };

  const formatPoints = (points: number) => {
    if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
    if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
    return points.toString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.podiumContainer}>
        {podiumOrder.map((entry, index) => {
          const actualRank = entry ? entry.rank : null;
          const isFirst = actualRank === 1;
          
          return (
            <View key={index} style={styles.podiumItem}>
              {entry ? (
                <>
                  <View style={[styles.avatarContainer, { height: getPodiumHeight(actualRank) }]}>
                    <LinearGradient
                      colors={isFirst 
                        ? [theme.accent, theme.accentSecondary]
                        : [theme.surface, theme.surfaceLight]
                      }
                      style={styles.avatar}
                    >
                      <RankDisplay rank={actualRank!} theme={theme} size="large" />
                    </LinearGradient>
                  </View>
                  <View style={[styles.podiumBase, { height: getPodiumHeight(actualRank) }]}>
                    <LinearGradient
                      colors={isFirst
                        ? [theme.accent, theme.accentSecondary]
                        : [theme.surface, theme.surfaceLight]
                      }
                      style={styles.baseGradient}
                    >
                      <Text style={[styles.pointsText, { color: isFirst ? theme.cardText : theme.text }]}>
                        {formatPoints(entry.points)}
                      </Text>
                      <Text style={[styles.levelText, { color: isFirst ? theme.cardText : theme.textSecondary }]}>
                        Lv {entry.level}
                      </Text>
                    </LinearGradient>
                  </View>
                </>
              ) : (
                <View style={[styles.emptyPodium, { height: getPodiumHeight(null) }]} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
  },
  avatarContainer: {
    width: '100%',
    borderRadius: 16,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumBase: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  baseGradient: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyPodium: {
    width: '100%',
    backgroundColor: 'transparent',
  },
});
