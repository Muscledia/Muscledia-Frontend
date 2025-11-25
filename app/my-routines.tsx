import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, TrendingUp, Clock, ChevronRight, Edit, Plus } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { RoutineService } from '@/services';
import { RoutineFolder } from '@/types/api';
import { useHaptics } from '@/hooks/useHaptics';

export default function MyRoutinesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const router = useRouter();
  const { impact } = useHaptics();

  const [routines, setRoutines] = useState<RoutineFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch personal routines
  const fetchPersonalRoutines = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      const response = await RoutineService.getPersonalRoutineFolders();
      
      if (response.success && response.data) {
        setRoutines(response.data);
      } else {
        setError(response.message || 'Failed to load routines');
      }
    } catch (err: any) {
      console.error('Error fetching personal routines:', err);
      setError(err.message || 'An error occurred while loading routines');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchPersonalRoutines();
  }, []);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPersonalRoutines();
    }, [])
  );


  // Pull to refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchPersonalRoutines(true);
  };

  // Difficulty badge color
  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) {
      return theme.textMuted;
    }
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FFA500';
      case 'advanced':
        return '#F44336';
      default:
        return theme.textMuted;
    }
  };

  // Render routine card
  const renderRoutineCard = ({ item }: { item: RoutineFolder }) => (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={async () => {
          await impact('selection');
          router.push({
            pathname: `/routine-detail/${item.id}`,
            params: { routineData: JSON.stringify(item) }
          });
        }}
      >
        <LinearGradient
          colors={[theme.surface, theme.surfaceLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          )}
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
                {item.title || item.name}
              </Text>
              <TouchableOpacity 
                onPress={async (e) => {
                  e.stopPropagation();
                  await impact('selection');
                  router.push({
                    pathname: '/routine-editor',
                    params: { id: item.id, routineData: JSON.stringify(item) }
                  });
                }}
                style={styles.editButton}
              >
                <Edit size={20} color={theme.accent} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.cardDescription, { color: theme.textSecondary }]} numberOfLines={3}>
              {item.description}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.tagsContainer}>
                <View
                  style={[
                    styles.tag,
                    { backgroundColor: getDifficultyColor(item.difficultyLevel) + '20' },
                  ]}
                >
                  <TrendingUp
                    size={14}
                    color={getDifficultyColor(item.difficultyLevel)}
                  />
                  <Text
                    style={[
                      styles.tagText,
                      { color: getDifficultyColor(item.difficultyLevel) },
                    ]}
                  >
                    {item.difficultyLevel || 'Intermediate'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.tag,
                    { backgroundColor: theme.accent + '20' },
                  ]}
                >
                  <Clock size={14} color={theme.accent} />
                  <Text style={[styles.tagText, { color: theme.accent }]}>
                    {item.workoutPlanCount ? `${item.workoutPlanCount} Workouts` : '0 Workouts'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Extra Info Row */}
            <View style={styles.extraInfoRow}>
                <Text style={[styles.extraInfoText, { color: theme.textMuted }]}>
                    {item.equipmentType} • {item.workoutSplit}
                </Text>
            </View>
          </View>

          {/* Golden accent stripe */}
          <View style={[styles.accentStripe, { backgroundColor: theme.accent }]} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading your routines...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonIcon}>
            <ChevronRight size={24} color={theme.text} style={{transform: [{rotate: '180deg'}]}} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Routines</Text>
        <TouchableOpacity 
            onPress={() => router.push('/routine-builder')}
            style={styles.addButton}
        >
            <Plus size={24} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={routines}
        renderItem={renderRoutineCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
            !loading && !error ? (
                <View style={styles.centerContent}>
                    <Dumbbell size={64} color={theme.textMuted} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    No Personal Routines
                    </Text>
                    <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
                    Create your first custom routine collection!
                    </Text>
                    <TouchableOpacity
                    onPress={async () => {
                        await impact('medium');
                        router.push('/routine-builder');
                    }}
                    style={styles.createButton}
                    >
                    <LinearGradient
                        colors={[theme.accent, theme.accentSecondary]}
                        locations={[0.55, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.createButtonGradient}
                    >
                        <Text style={[styles.createButtonText, { color: theme.cardText }]}>
                        Create Routine
                        </Text>
                    </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : null
        }
      />
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
      paddingTop: 60,
      paddingBottom: 16,
  },
  headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
  },
  backButtonIcon: {
      padding: 8,
  },
  addButton: {
      padding: 8,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 40,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#1C1C1C',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  extraInfoRow: {
      marginTop: 4,
  },
  extraInfoText: {
      fontSize: 12,
  },
  accentStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

