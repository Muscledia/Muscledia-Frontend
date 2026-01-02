import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { PRStatistics } from '@/types/personalRecords';
import { Colors, getThemeColors } from '@/constants/Colors';
import { Trophy, TrendingUp, Calendar, Activity } from 'lucide-react-native';

interface PRStatisticsCardProps {
  statistics: PRStatistics;
}

export const PRStatisticsCard: React.FC<PRStatisticsCardProps> = ({ statistics }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  const formatLastPRDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>Personal Records</Text>
      
      <View style={styles.mainStatsRow}>
        <View style={styles.mainStat}>
          <Text style={[styles.bigNumber, { color: theme.accent }]}>{statistics.totalPRs}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total PRs</Text>
        </View>
        <View style={styles.mainStat}>
          <Text style={[styles.bigNumber, { color: theme.accent }]}>{statistics.prsThisMonth}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>This Month</Text>
        </View>
        <View style={styles.mainStat}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[styles.bigNumber, { color: theme.accent }]}>{statistics.averageImprovement.toFixed(1)}%</Text>
          </View>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Avg. Gain</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Trophy size={16} color={theme.textSecondary} />
          <Text style={[styles.detailValue, { color: theme.text }]}>{statistics.prsThisWeek}</Text>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>This Week</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Calendar size={16} color={theme.textSecondary} />
          <Text style={[styles.detailValue, { color: theme.text }]}>{formatLastPRDate(statistics.lastPRDate)}</Text>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Last PR</Text>
        </View>

        <View style={styles.detailItem}>
          <Activity size={16} color={theme.textSecondary} />
          <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
            {statistics.topExercise || 'None'}
          </Text>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Top Exercise</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.typeBreakdown}>
        <Text style={[styles.subTitle, { color: theme.textSecondary }]}>By Type</Text>
        <View style={styles.barsContainer}>
          <TypeBar 
            label="Weight" 
            count={statistics.prsByType.MAX_WEIGHT} 
            total={statistics.totalPRs} 
            color="#FF9800"
            theme={theme}
          />
          <TypeBar 
            label="Reps" 
            count={statistics.prsByType.MAX_REPS} 
            total={statistics.totalPRs} 
            color="#2196F3"
            theme={theme}
          />
          <TypeBar 
            label="Volume" 
            count={statistics.prsByType.MAX_VOLUME} 
            total={statistics.totalPRs} 
            color="#4CAF50"
            theme={theme}
          />
           <TypeBar 
            label="1RM" 
            count={statistics.prsByType.ESTIMATED_1RM || 0} 
            total={statistics.totalPRs} 
            color="#9C27B0"
            theme={theme}
          />
        </View>
      </View>
    </View>
  );
};

const TypeBar = ({ label, count, total, color, theme }: { label: string, count: number, total: number, color: string, theme: any }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <View style={styles.barRow}>
      <Text style={[styles.barLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.barValue, { color: theme.text }]}>{count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  mainStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mainStat: {
    alignItems: 'center',
    flex: 1,
  },
  bigNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  typeBreakdown: {
    marginTop: 4,
  },
  barsContainer: {
    gap: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 50,
    fontSize: 12,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  barValue: {
    width: 30,
    fontSize: 12,
    textAlign: 'right',
  },
});
