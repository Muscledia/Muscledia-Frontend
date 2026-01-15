import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserChallenge } from '@/types/gamification.types';
import { Trophy, Clock, Zap, AlertTriangle } from 'lucide-react-native';
import ProgressBar from '@/components/ProgressBar';

interface Props {
  userChallenge: UserChallenge;
  theme: any;
}

export const ActiveChallengeCard: React.FC<Props> = ({ userChallenge, theme }) => {
  // Use backend signals for colors
  const mainColor = userChallenge.statusColor === 'blue' ? theme.accent : userChallenge.statusColor;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: theme.text }]}>{userChallenge.challengeName}</Text>
          {userChallenge.isLegendary && <Zap size={16} color="#FFD700" fill="#FFD700" />}
        </View>
        <View style={[styles.badge, { backgroundColor: mainColor + '20' }]}>
          <Text style={[styles.badgeText, { color: mainColor }]}>
            {userChallenge.challengeType}
          </Text>
        </View>
      </View>

      <Text style={[styles.desc, { color: theme.textSecondary }]}>{userChallenge.description}</Text>

      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: theme.text }]}>
            {userChallenge.currentProgress} / {userChallenge.targetValue} {userChallenge.progressUnit}
          </Text>
          <Text style={[styles.percent, { color: theme.textMuted }]}>
            {Math.round(userChallenge.progressPercentage)}%
          </Text>
        </View>
        <ProgressBar
          progress={userChallenge.progressPercentage / 100}
          color={userChallenge.progressColor || theme.accent} // Uses backend suggestion
          height={8}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.timer}>
          <Clock size={14} color={userChallenge.isExpiringSoon ? theme.error : theme.textMuted} />
          <Text style={[
            styles.timerText,
            { color: userChallenge.isExpiringSoon ? theme.error : theme.textMuted }
          ]}>
            {userChallenge.timeRemaining}
          </Text>
        </View>

        <View style={styles.rewards}>
          <View style={styles.rewardItem}>
            <Trophy size={14} color={theme.accent} />
            <Text style={[styles.rewardText, { color: theme.text }]}>{userChallenge.rewardPoints}</Text>
          </View>
          {userChallenge.rewardCoins > 0 && (
            <View style={styles.rewardItem}>
              <Text style={{fontSize: 12}}>🪙</Text>
              <Text style={[styles.rewardText, { color: theme.text }]}>{userChallenge.rewardCoins}</Text>
            </View>
          )}
        </View>
      </View>

      {userChallenge.safetyNote && (
        <View style={styles.safetyRow}>
          <AlertTriangle size={12} color={theme.warning} />
          <Text style={[styles.safetyText, { color: theme.textMuted }]}>{userChallenge.safetyNote}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 16, marginBottom: 12, width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  name: { fontSize: 17, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  desc: { fontSize: 13, marginBottom: 16, lineHeight: 18 },
  progressSection: { marginBottom: 16 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontSize: 14, fontWeight: '600' },
  percent: { fontSize: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerText: { fontSize: 12, fontWeight: '500' },
  rewards: { flexDirection: 'row', gap: 12 },
  rewardItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rewardText: { fontSize: 13, fontWeight: 'bold' },
  safetyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, borderTopWidth: 0.5, borderTopColor: 'rgba(128,128,128,0.2)', paddingTop: 8 },
  safetyText: { fontSize: 11, fontStyle: 'italic' }
});
