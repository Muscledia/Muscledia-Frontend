import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, FlatList, LayoutAnimation, Platform, UIManager } from 'react-native';
import { PersonalRecord } from '@/types/personalRecords';
import { Colors, getThemeColors } from '@/constants/Colors';
import { Trophy, Calendar, ChevronRight, TrendingUp, ChevronDown } from 'lucide-react-native';
import { useHaptics } from '@/hooks/useHaptics';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface PRListProps {
  records: PersonalRecord[];
  onRecordPress?: (record: PersonalRecord) => void;
}

export const PRList: React.FC<PRListProps> = ({ records, onRecordPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

  // Group records by exercise
  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.exerciseName]) {
      acc[record.exerciseName] = [];
    }
    acc[record.exerciseName].push(record);
    return acc;
  }, {} as Record<string, PersonalRecord[]>);

  // Sort exercises by most recent PR
  const sortedExercises = Object.keys(groupedRecords).sort((a, b) => {
    const latestA = Math.max(...groupedRecords[a].map(r => new Date(r.achievedDate).getTime()));
    const latestB = Math.max(...groupedRecords[b].map(r => new Date(r.achievedDate).getTime()));
    return latestB - latestA;
  });

  return (
    <FlatList
      data={sortedExercises}
      renderItem={({ item }) => (
        <ExerciseGroup 
          exerciseName={item} 
          records={groupedRecords[item]} 
          theme={theme} 
          onRecordPress={onRecordPress}
          impact={impact}
        />
      )}
      keyExtractor={item => item}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No personal records yet.</Text>
        </View>
      }
    />
  );
};

const ExerciseGroup = ({ 
  exerciseName, 
  records, 
  theme, 
  onRecordPress,
  impact 
}: { 
  exerciseName: string, 
  records: PersonalRecord[], 
  theme: any, 
  onRecordPress?: (record: PersonalRecord) => void,
  impact: (style: any) => void
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    impact('light');
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const exerciseRecords = records.sort((a, b) => 
    new Date(b.achievedDate).getTime() - new Date(a.achievedDate).getTime()
  );

  return (
    <View style={[styles.exerciseGroup, { backgroundColor: theme.surface }]}>
      <TouchableOpacity 
        style={styles.groupHeader} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={[styles.exerciseName, { color: theme.text }]}>{exerciseName}</Text>
        <View style={styles.headerRight}>
          <View style={[styles.badge, { backgroundColor: theme.accent + '20' }]}>
            <Text style={[styles.badgeText, { color: theme.accent }]}>{exerciseRecords.length} PRs</Text>
          </View>
          {expanded ? (
            <ChevronDown size={20} color={theme.textSecondary} />
          ) : (
            <ChevronRight size={20} color={theme.textSecondary} />
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View>
          {exerciseRecords.map((record) => (
            <PRItem 
              key={record.id} 
              record={record} 
              theme={theme}
              onPress={() => {
                impact('light');
                onRecordPress?.(record);
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const PRItem = ({ record, theme, onPress }: { record: PersonalRecord, theme: any, onPress: () => void }) => {
  const isRecent = (new Date().getTime() - new Date(record.achievedDate).getTime()) < (7 * 24 * 60 * 60 * 1000);
  
  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'MAX_WEIGHT': return 'Max Weight';
      case 'MAX_REPS': return 'Max Reps';
      case 'MAX_VOLUME': return 'Max Volume';
      case 'ESTIMATED_1RM': return 'Est. 1RM';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'MAX_WEIGHT': return '#FF9800';
      case 'MAX_REPS': return '#2196F3';
      case 'MAX_VOLUME': return '#4CAF50';
      case 'ESTIMATED_1RM': return '#9C27B0';
      default: return theme.text;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.recordItem, { borderTopColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.recordLeft}>
        <View style={styles.typeRow}>
          <View style={[styles.typeDot, { backgroundColor: getTypeColor(record.recordType) }]} />
          <Text style={[styles.typeText, { color: theme.textSecondary }]}>
            {getTypeLabel(record.recordType)}
          </Text>
          {isRecent && (
            <View style={[styles.newBadge, { backgroundColor: theme.accent }]}>
              <Text style={styles.newText}>NEW</Text>
            </View>
          )}
        </View>
        <Text style={[styles.recordValue, { color: theme.text }]}>
          {record.formattedDescription}
        </Text>
        <View style={styles.dateRow}>
          <Calendar size={12} color={theme.textSecondary} />
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            {new Date(record.achievedDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.recordRight}>
        {record.improvementPercentage && record.improvementPercentage > 0 && (
          <View style={[styles.improvementBadge, { backgroundColor: '#4CAF50' + '20' }]}>
            <TrendingUp size={12} color="#4CAF50" />
            <Text style={[styles.improvementText, { color: '#4CAF50' }]}>
              +{record.improvementPercentage.toFixed(1)}%
            </Text>
          </View>
        )}
        <ChevronRight size={20} color={theme.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  exerciseGroup: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  recordLeft: {
    flex: 1,
    gap: 4,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  newBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  newText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'white',
  },
  recordValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
  },
  recordRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  improvementText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
