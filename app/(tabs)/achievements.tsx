import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useCharacter } from '@/hooks/useCharacter';
import { Colors, getThemeColors } from '@/constants/Colors';
import { Trophy, Zap, Swords, ShieldCheck } from 'lucide-react-native';
import { useRaid } from '@/hooks/useRaid';
import { LinearGradient } from 'expo-linear-gradient';

export default function MuscleChampionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { character } = useCharacter();
  const { state, resetForNewWeekIfNeeded } = useRaid();

  const progress = Math.max(0, Math.min(1, state.totalSets / state.boss.weeklyTargetSets));
  const remaining = Math.max(0, state.boss.weeklyTargetSets - state.totalSets);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Boss Banner */}
      <LinearGradient
        colors={[theme.accent, theme.accentSecondary]}
        locations={[0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.bannerHeader}>
          <Swords size={28} color={theme.cardText} />
          <Text style={[styles.bannerTitle, { color: theme.cardText }]}>Muscle Champions</Text>
          <ShieldCheck size={28} color={theme.cardText} />
        </View>
        <Text style={[styles.bossName, { color: theme.cardText }]}>{state.boss.name}</Text>
        <Text style={[styles.bossDesc, { color: theme.cardText }]}>{state.boss.description}</Text>
      </LinearGradient>

      {/* Progress Card */}
      <View style={[styles.progressCard, { backgroundColor: theme.surface }]}> 
        <View style={styles.progressRow}> 
          <Text style={[styles.progressLabel, { color: theme.text }]}>Week</Text>
          <Text style={[styles.progressValue, { color: theme.text }]}>{state.weekKey}</Text>
        </View>
        <View style={styles.progressRow}> 
          <Text style={[styles.progressLabel, { color: theme.text }]}>Target Sets</Text>
          <Text style={[styles.progressValue, { color: theme.text }]}>{state.boss.weeklyTargetSets}</Text>
        </View>
        <View style={styles.progressRow}> 
          <Text style={[styles.progressLabel, { color: theme.text }]}>Contributed</Text>
          <Text style={[styles.progressValue, { color: theme.text }]}>{state.totalSets}</Text>
        </View>
        <View style={styles.progressRow}> 
          <Text style={[styles.progressLabel, { color: theme.text }]}>Remaining</Text>
          <Text style={[styles.progressValue, { color: theme.text }]}>{remaining}</Text>
        </View>
        <View style={styles.progressBarOuter}> 
          <View style={[styles.progressBarInner, { width: `${progress * 100}%`, backgroundColor: theme.accent }]} />
        </View>
        <Text style={[styles.progressPct, { color: theme.textSecondary }]}>{Math.round(progress * 100)}% Complete</Text>
      </View>

      {/* Rewards */}
      <View style={styles.rewardsRow}> 
        <View style={[styles.reward, { backgroundColor: theme.surface }]}> 
          <Trophy size={22} color={theme.accent} />
          <Text style={[styles.rewardText, { color: theme.text }]}>+{state.boss.rewardXP} XP on clear</Text>
        </View>
        <View style={[styles.reward, { backgroundColor: theme.surface }]}> 
          <Zap size={22} color={theme.accent} />
          <Text style={[styles.rewardText, { color: theme.text }]}>Personal weekly challenge</Text>
        </View>
      </View>

      {/* How to play */}
      <View style={[styles.infoCard, { backgroundColor: theme.surface }]}> 
        <Text style={[styles.infoTitle, { color: theme.text }]}>How it works</Text>
        <Text style={[styles.infoLine, { color: theme.textSecondary }]}>• Complete sets in your routines. Each finished set adds +1.</Text>
        <Text style={[styles.infoLine, { color: theme.textSecondary }]}>• Your personal target is {state.boss.weeklyTargetSets} sets this week.</Text>
        <Text style={[styles.infoLine, { color: theme.textSecondary }]}>• Claim +{state.boss.rewardXP} XP when you reach the target.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16 },
  banner: { borderRadius: 16, padding: 16, marginBottom: 16 },
  bannerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bannerTitle: { fontSize: 18, fontWeight: 'bold' },
  bossName: { fontSize: 22, fontWeight: 'bold', marginTop: 8 },
  bossDesc: { fontSize: 13, marginTop: 4 },
  progressCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 13, opacity: 0.9 },
  progressValue: { fontSize: 13, fontWeight: '600' },
  progressBarOuter: { height: 10, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 8 },
  progressBarInner: { height: '100%' },
  progressPct: { fontSize: 12, marginTop: 6 },
  rewardsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  reward: { flex: 1, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  rewardText: { fontSize: 13, fontWeight: '600' },
  infoCard: { borderRadius: 16, padding: 16 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  infoLine: { fontSize: 13, marginBottom: 4 },
});