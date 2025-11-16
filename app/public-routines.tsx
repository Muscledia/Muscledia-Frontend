import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, getThemeColors } from '@/constants/Colors';
import { ArrowLeft, TrendingUp, Clock, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoutineFolder } from '@/types/api';
import { RoutineFolderService } from '@/services/routineFolderService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

export default function PublicRoutinesScreen() {
  // Always use dark mode
  const theme = getThemeColors(true);
  const { impact } = useHaptics();
  const insets = useSafeAreaInsets();

  const [routineFolders, setRoutineFolders] = useState<RoutineFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch public routine folders
  const fetchPublicRoutines = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      console.log('Fetching public routine folders...');
      const response = await RoutineFolderService.getPublicRoutineFolders();

      if (response.success && response.data) {
        setRoutineFolders(response.data);
        console.log(`Loaded ${response.data.length} public routine folders`);
      } else {
        throw new Error('Failed to load routine folders');
      }
    } catch (err: any) {
      console.error('Error fetching public routines:', err);
      setError(err.message || 'Failed to load routine folders. Please try again.');
    } finally {
      setLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPublicRoutines();
  }, [fetchPublicRoutines]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await impact('light');
    await fetchPublicRoutines(true);
  }, [fetchPublicRoutines, impact]);

  // Retry handler
  const handleRetry = async () => {
    await impact('medium');
    fetchPublicRoutines();
  };

  // Navigate to routine details
  const handleRoutinePress = async (folder: RoutineFolder) => {
    await impact('selection');
    // TODO: Navigate to routine folder details screen
    // router.push(`/routine-folder/${folder.id}`);
    console.log('Navigate to routine folder:', folder.id);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string): string => {
    const lower = difficulty.toLowerCase();
    if (lower.includes('beginner') || lower.includes('easy')) return Colors.status.success.main;
    if (lower.includes('intermediate') || lower.includes('medium')) return Colors.status.warning.main;
    if (lower.includes('advanced') || lower.includes('hard')) return Colors.status.error.main;
    return theme.accent;
  };

  // Render routine card
  const RoutineCard = ({ folder }: { folder: RoutineFolder }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => handleRoutinePress(folder)}
      activeOpacity={0.9}
    >
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        {/* Image */}
        {folder.imageUrl ? (
          <Image
            source={{ uri: folder.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[theme.accent, theme.accentSecondary]}
            locations={[0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardImagePlaceholder}
          >
            <TrendingUp size={32} color={theme.cardText} />
          </LinearGradient>
        )}

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
            {folder.name}
          </Text>
          <Text style={[styles.cardDescription, { color: theme.textSecondary }]} numberOfLines={2}>
            {folder.description}
          </Text>

          {/* Tags */}
          <View style={styles.cardTags}>
            <View style={[styles.tag, { backgroundColor: getDifficultyColor(folder.difficulty) + '20' }]}>
              <Text style={[styles.tagText, { color: getDifficultyColor(folder.difficulty) }]}>
                {folder.difficulty}
              </Text>
            </View>
            {folder.duration && (
              <View style={[styles.tag, { backgroundColor: theme.surfaceLight }]}>
                <Clock size={12} color={theme.textMuted} />
                <Text style={[styles.tagText, { color: theme.textMuted, marginLeft: 4 }]}>
                  {folder.duration}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: Math.max(16, insets.top + 8) }]}>
          <TouchableOpacity onPress={async () => { await impact('selection'); router.back(); }}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Public Routines</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading routines...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: Math.max(16, insets.top + 8) }]}>
          <TouchableOpacity onPress={async () => { await impact('selection'); router.back(); }}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Public Routines</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <View style={[styles.errorIcon, { backgroundColor: Colors.status.error.light }]}>
            <AlertCircle size={48} color={Colors.status.error.main} />
          </View>
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            Oops! Something went wrong
          </Text>
          <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.accent }]}
            onPress={handleRetry}
            activeOpacity={0.9}
          >
            <Text style={[styles.retryButtonText, { color: theme.cardText }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Empty state
  if (!loading && routineFolders.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: Math.max(16, insets.top + 8) }]}>
          <TouchableOpacity onPress={async () => { await impact('selection'); router.back(); }}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Public Routines</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView
          contentContainerStyle={styles.centerContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.accent}
              colors={[theme.accent]}
            />
          }
        >
          <TrendingUp size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No Routines Yet
          </Text>
          <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
            Check back soon for new workout routines from the community!
          </Text>
        </ScrollView>
      </View>
    );
  }

  // Main content with data
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top + 8) }]}>
        <TouchableOpacity onPress={async () => { await impact('selection'); router.back(); }}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Public Routines</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      >
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Discover {routineFolders.length} workout {routineFolders.length === 1 ? 'program' : 'programs'}
        </Text>

        <View style={styles.grid}>
          {routineFolders.map((folder) => (
            <RoutineCard key={folder.id} folder={folder} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#1C1C1C',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    minHeight: 40, // 2 lines
  },
  cardDescription: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
    minHeight: 32, // 2 lines
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  errorIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
    lineHeight: 20,
  },
});

