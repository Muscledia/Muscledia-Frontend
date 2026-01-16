import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trophy, Medal, Award } from 'lucide-react-native';

interface RankDisplayProps {
  rank: number;
  theme: any;
  size?: 'small' | 'medium' | 'large';
}

export function RankDisplay({ rank, theme, size = 'medium' }: RankDisplayProps) {
  const getRankIcon = () => {
    if (rank === 1) {
      return <Trophy size={size === 'large' ? 32 : size === 'small' ? 20 : 24} color="#FFD700" fill="#FFD700" />;
    } else if (rank === 2) {
      return <Medal size={size === 'large' ? 32 : size === 'small' ? 20 : 24} color="#C0C0C0" fill="#C0C0C0" />;
    } else if (rank === 3) {
      return <Award size={size === 'large' ? 32 : size === 'small' ? 20 : 24} color="#CD7F32" fill="#CD7F32" />;
    }
    return null;
  };

  const getRankColor = () => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return theme.textSecondary;
  };

  const fontSize = size === 'large' ? 24 : size === 'small' ? 14 : 18;
  const fontWeight = rank <= 3 ? 'bold' : '600';

  return (
    <View style={styles.container}>
      {getRankIcon() || (
        <Text style={[styles.rankText, { color: getRankColor(), fontSize, fontWeight }]}>
          #{rank}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  rankText: {
    fontWeight: '600',
  },
});
