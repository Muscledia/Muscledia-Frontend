// app/public-routines.tsx - COMPLETE REFACTORED VERSION

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, TrendingUp, Clock, ChevronRight } from 'lucide-react-native';
import { getThemeColors } from '@/constants/Colors';
import { RoutineService } from '@/services';
import { RoutineFolder } from '@/types';
import { useHaptics } from '@/hooks/useHaptics';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

export default function PublicRoutinesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const router = useRouter();
  const { impact } = useHaptics();

  const [routines, setRoutines] = useState<RoutineFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch public routines
  const fetchPublicRoutines = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      const response = await RoutineService.getPublicRoutineFolders();

      if (response.success && response.data) {
        setRoutines(response.data);
      } else {
        setError(response.message || 'Failed to load routines');
      }
    } catch (err: any) {
      console.error('Error fetching public routines:', err);
      setError(err.message || 'An error occurred while loading routines');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPublicRoutines();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPublicRoutines(true);
  };

  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return theme.textMuted;

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

  const renderRoutineCard = ({ item }: { item: RoutineFolder }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={async () => {
        await impact('selection');
        router.push({
          pathname: `/routine-detail/${item.id}`,
          params: {
            routineData: JSON.stringify(item),
            isPublic: 'true' // CRITICAL: This flag tells detail screen it's a public routine
          }
        });
      }}
      style={styles.cardWrapper}
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
              {item.name || item.title}
            </Text>
            <ChevronRight size={24} color={theme.accent} />
          </View>

          <Text style={[styles.cardDescription, { color: theme.textSecondary }]} numberOfLines={3}>
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.tagsContainer}>
              <View
                style={[
                  styles.tag,
                  { backgroundColor: getDifficultyColor(item.difficulty) + '20' },
                ]}
              >
                <TrendingUp
                  size={14}
                  color={getDifficultyColor(item.difficulty)}
                />
                <Text
                  style={[
                    styles.tagText,
                    { color: getDifficultyColor(item.difficulty) },
                  ]}
                >
                  {item.difficulty || 'N/A'}
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
                  {item.duration}
                </Text>
              </View>
            </View>

            {/* <Text style={[styles.authorText, { color: theme.textMuted }]}>
              by {item.createdBy}
            </Text> */}
          </View>
        </View>

        <View style={[styles.accentStripe, { backgroundColor: theme.accent }]} />
      </LinearGradient>
    </TouchableOpacity>
  );

  // CLEAN STATE HANDLING: Use shared components
  if (loading) return <LoadingScreen message="Loading routines..." theme={theme} />;

  if (error) return <ErrorState error={error} onRetry={fetchPublicRoutines} theme={theme} />;

  if (routines.length === 0) {
    return (
      <EmptyState
        icon={<Dumbbell size={64} color={theme.textMuted} />}
        title="No Routines Available"
        message="Check back later for new workout programs!"
        action={{ label: 'Go Back', onPress: () => router.back() }}
        theme={theme}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
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
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
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
  authorText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  accentStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
});
