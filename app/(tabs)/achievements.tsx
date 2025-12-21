import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BadgeService } from '@/services/badgeService';
import { BadgeStatus } from '@/types';
import { Colors, getThemeColors } from '@/constants/Colors';
import { Award, Check, X, Filter, ChevronDown, Trophy, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

type StatusFilter = 'all' | 'earned' | 'locked';
type TypeFilter = 'all' | 'EXERCISE' | 'CHAMPION' | 'STREAK' | 'PR';
type SortOption = 'recent' | 'points' | 'alphabetical';

const getBadgeTypeColor = (badgeType: string, isDark: boolean): string[] => {
  switch (badgeType) {
    case 'EXERCISE':
      return isDark ? ['#10b981', '#059669'] : ['#059669', '#047857'];
    case 'CHAMPION':
      return isDark ? ['#f59e0b', '#d97706'] : ['#d97706', '#b45309'];
    case 'STREAK':
      return isDark ? ['#ef4444', '#dc2626'] : ['#dc2626', '#b91c1c'];
    case 'PR':
      return isDark ? ['#8b5cf6', '#7c3aed'] : ['#7c3aed', '#6d28d9'];
    default:
      return isDark ? ['#6b7280', '#4b5563'] : ['#4b5563', '#374151'];
  }
};

const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const getCriteriaDescription = (badge: BadgeStatus): string => {
  const { criteriaType, criteriaParams } = badge;
  const target = criteriaParams?.targetValue ?? 0;

  switch (criteriaType) {
    case 'WORKOUT_COUNT':
      return target === 0 ? 'Join Muscledia' : `Complete ${target} workout${target !== 1 ? 's' : ''}`;
    case 'WORKOUT_DURATION':
      const hours = Math.floor(target / 60);
      const minutes = target % 60;
      if (hours > 0) {
        return `Workout for ${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minutes` : ''}`;
      }
      return `Workout for ${target} minutes`;
    case 'WORKOUT_STREAK':
      return `Complete ${target} consecutive day${target !== 1 ? 's' : ''} of workouts`;
    case 'PERSONAL_RECORD':
      return `Achieve ${target} personal record${target !== 1 ? 's' : ''}`;
    case 'LEVEL_REACHED':
      return `Reach Level ${target}`;
    case 'EXERCISE_COUNT':
      return `Perform ${target} different exercise${target !== 1 ? 's' : ''}`;
    case 'WEIGHT_LIFTED_TOTAL':
      return `Lift a total of ${target.toLocaleString()} kg`;
    case 'WEEKLY_WORKOUTS':
      return `Complete ${target} workout${target !== 1 ? 's' : ''} in a week`;
    case 'MONTHLY_WORKOUTS':
      return `Complete ${target} workout${target !== 1 ? 's' : ''} in a month`;
    case 'POINTS_EARNED':
      return `Earn ${target.toLocaleString()} total points`;
    case 'LOGIN_STREAK':
      return `Log in for ${target} consecutive day${target !== 1 ? 's' : ''}`;
    default:
      return 'Complete the requirements';
  }
};

interface BadgeCardProps {
  badge: BadgeStatus;
  onPress: () => void;
  isDark: boolean;
  theme: ReturnType<typeof getThemeColors>;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onPress, isDark, theme }) => {
  const isEarned = badge.isEarned;
  const colors = getBadgeTypeColor(badge.badgeType, isDark);

  return (
    <Animated.View entering={FadeInDown.delay(Math.random() * 100)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.badgeCard,
          {
            backgroundColor: theme.surface,
            borderColor: isEarned ? colors[0] : theme.border,
            borderWidth: isEarned ? 2 : 1,
          },
        ]}
      >
        {/* Badge Icon */}
        <View style={styles.badgeIconContainer}>
          {isEarned ? (
            <LinearGradient
              colors={colors as [string, string]}
              style={styles.badgeIcon}
            >
              <Award size={32} color="#fff" />
            </LinearGradient>
          ) : (
            <View style={[styles.badgeIcon, { backgroundColor: theme.background }]}>
              <Award size={32} color={theme.textMuted} />
            </View>
          )}
        </View>

        {/* Badge Info */}
        <Text
          style={[
            styles.badgeName,
            { color: isEarned ? theme.text : theme.textMuted },
            isEarned && styles.badgeNameEarned,
          ]}
          numberOfLines={2}
        >
          {badge.name}
        </Text>

        {/* Points */}
        <View style={[styles.pointsBadge, { backgroundColor: isEarned ? colors[0] : theme.background }]}>
          <Zap size={12} color={isEarned ? '#fff' : theme.textMuted} />
          <Text style={[styles.pointsText, { color: isEarned ? '#fff' : theme.textMuted }]}>
            {badge.pointsAwarded} pts
          </Text>
        </View>

        {/* Status or Progress Bar */}
        {isEarned ? (
          <View style={styles.earnedIndicator}>
            <Check size={14} color={colors[0]} />
            <Text style={[styles.earnedText, { color: colors[0] }]}>
              {badge.earnedAt ? formatRelativeTime(badge.earnedAt) : 'Earned'}
            </Text>
          </View>
        ) : (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.background }]}>
              <View
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min(100, badge.progress ?? 0)}%`, 
                    backgroundColor: colors[0] 
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
              {Math.round(badge.progress ?? 0)}%
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

interface BadgeDetailModalProps {
  badge: BadgeStatus | null;
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  theme: ReturnType<typeof getThemeColors>;
}

const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  visible,
  onClose,
  isDark,
  theme,
}) => {
  if (!badge) return null;

  const isEarned = badge.isEarned;
  const colors = getBadgeTypeColor(badge.badgeType, isDark);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Badge Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          {/* Badge Icon */}
          <View style={styles.modalBadgeContainer}>
            {isEarned ? (
              <LinearGradient colors={colors as [string, string]} style={styles.modalBadgeIcon}>
                <Award size={64} color="#fff" />
              </LinearGradient>
            ) : (
              <View style={[styles.modalBadgeIcon, { backgroundColor: theme.surface }]}>
                <Award size={64} color={theme.textMuted} />
              </View>
            )}
          </View>

          {/* Badge Name */}
          <Text style={[styles.modalBadgeName, { color: theme.text }]}>{badge.name}</Text>

          {/* Status Badge */}
          <View
            style={[
              styles.modalStatusBadge,
              { backgroundColor: isEarned ? colors[0] : theme.surface },
            ]}
          >
            {isEarned ? (
              <>
                <Check size={16} color="#fff" />
                <Text style={styles.modalStatusText}>Earned</Text>
              </>
            ) : (
              <Text style={[styles.modalStatusText, { color: theme.textMuted }]}>Locked</Text>
            )}
          </View>

          {/* Description */}
          <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
            {badge.description}
          </Text>

          {/* Requirements */}
          <View style={[styles.modalSection, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalSectionTitle, { color: theme.text }]}>How to Earn</Text>
            <Text style={[styles.modalSectionText, { color: theme.textSecondary }]}>
              {getCriteriaDescription(badge)}
            </Text>
          </View>

          {/* Points */}
          <View style={[styles.modalSection, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Points Awarded</Text>
            <View style={styles.modalPointsRow}>
              <Zap size={20} color={colors[0]} />
              <Text style={[styles.modalPointsValue, { color: theme.text }]}>
                {badge.pointsAwarded} points
              </Text>
            </View>
          </View>

          {/* Progress (if trackable) */}
          {!isEarned && badge.progress !== undefined && (
            <View style={[styles.modalSection, { backgroundColor: theme.surface }]}>
              <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Progress</Text>
              <View style={styles.modalProgressContainer}>
                <View style={[styles.modalProgressBar, { backgroundColor: theme.background }]}>
                  <View
                    style={[
                      styles.modalProgressFill,
                      { width: `${Math.min(100, badge.progress)}%`, backgroundColor: colors[0] },
                    ]}
                  />
                </View>
                <Text style={[styles.modalProgressText, { color: theme.textSecondary }]}>
                  {Math.round(badge.progress)}% complete
                </Text>
              </View>
            </View>
          )}

          {/* Earned Date */}
          {isEarned && badge.earnedAt && (
            <View style={[styles.modalSection, { backgroundColor: theme.surface }]}>
              <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Earned On</Text>
              <Text style={[styles.modalSectionText, { color: theme.textSecondary }]}>
                {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Text style={[styles.modalSectionSubtext, { color: theme.textMuted }]}>
                {formatRelativeTime(badge.earnedAt)}
              </Text>
            </View>
          )}

          {/* Badge Type */}
          <View style={[styles.modalSection, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Type</Text>
            <View
              style={[
                styles.modalTypeBadge,
                { backgroundColor: colors[0] + '20', borderColor: colors[0] },
              ]}
            >
              <Text style={[styles.modalTypeText, { color: colors[0] }]}>
                {badge.badgeType}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default function BadgesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  const [badges, setBadges] = useState<BadgeStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeStatus | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');

  const loadBadges = useCallback(
    async (forceRefresh = false) => {
      try {
        setError(null);
        const badgeStatuses = await BadgeService.getBadgeStatus(forceRefresh);
        setBadges(badgeStatuses);
      } catch (err: any) {
        console.error('Failed to load badges:', err);
        setError(err.message || 'Failed to load badges');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBadges(true);
  }, [loadBadges]);

  // Filter and sort badges
  const filteredAndSortedBadges = useMemo(() => {
    let filtered = badges;

    // Status filter
    if (statusFilter === 'earned') {
      filtered = filtered.filter((b) => b.isEarned);
    } else if (statusFilter === 'locked') {
      filtered = filtered.filter((b) => !b.isEarned);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((b) => b.badgeType === typeFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'recent':
          // Earned first, then by earned date (most recent first)
          if (a.isEarned && !b.isEarned) return -1;
          if (!a.isEarned && b.isEarned) return 1;
          if (a.isEarned && b.isEarned) {
            const aDate = a.earnedAt ? new Date(a.earnedAt).getTime() : 0;
            const bDate = b.earnedAt ? new Date(b.earnedAt).getTime() : 0;
            return bDate - aDate;
          }
          return 0;
        case 'points':
          return b.pointsAwarded - a.pointsAwarded;
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [badges, statusFilter, typeFilter, sortOption]);

  const earnedCount = badges.filter((b) => b.isEarned).length;
  const totalCount = badges.length;
  const completionPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} style={styles.loader} />
      </View>
    );
  }

  if (error && badges.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.accent }]}
          onPress={() => loadBadges(true)}
        >
          <Text style={[styles.retryButtonText, { color: theme.cardText }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
    <ScrollView 
        style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Progress Header */}
        <View style={[styles.progressHeader, { backgroundColor: theme.surface }]}>
        <View style={styles.progressRow}> 
            <Trophy size={24} color={theme.accent} />
            <View style={styles.progressTextContainer}>
              <Text style={[styles.progressTitle, { color: theme.text }]}>
                {earnedCount} of {totalCount} badges earned
              </Text>
              <Text style={[styles.progressSubtitle, { color: theme.textSecondary }]}>
                {completionPercentage}% complete
              </Text>
        </View>
        </View>
          <View style={[styles.progressBarContainer, { backgroundColor: theme.background }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${completionPercentage}%`, backgroundColor: theme.accent },
              ]}
            />
        </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {/* Status Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {(['all', 'earned', 'locked'] as StatusFilter[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setStatusFilter(filter)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: statusFilter === filter ? theme.accent : theme.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: statusFilter === filter ? theme.cardText : theme.text,
                      fontWeight: statusFilter === filter ? '600' : '400',
                    },
                  ]}
                >
                  {filter === 'all' ? 'All' : filter === 'earned' ? 'Earned' : 'Locked'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Type Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {(['all', 'EXERCISE', 'CHAMPION', 'STREAK', 'PR'] as TypeFilter[]).map(
              (filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setTypeFilter(filter)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: typeFilter === filter ? theme.accent : theme.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: typeFilter === filter ? theme.cardText : theme.text,
                        fontWeight: typeFilter === filter ? '600' : '400',
                      },
                    ]}
                  >
                    {filter === 'all' ? 'All Types' : filter}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          {/* Sort */}
          <View style={styles.sortContainer}>
            <Text style={[styles.sortLabel, { color: theme.textSecondary }]}>Sort:</Text>
            <TouchableOpacity
              style={[styles.sortButton, { backgroundColor: theme.surface }]}
              onPress={() => {
                const options: SortOption[] = ['recent', 'points', 'alphabetical'];
                const currentIndex = options.indexOf(sortOption);
                setSortOption(options[(currentIndex + 1) % options.length]);
              }}
            >
              <Text style={[styles.sortText, { color: theme.text }]}>
                {sortOption === 'recent'
                  ? 'Recently Earned'
                  : sortOption === 'points'
                  ? 'Points (High to Low)'
                  : 'Alphabetical'}
              </Text>
              <ChevronDown size={16} color={theme.textMuted} />
            </TouchableOpacity>
        </View>
      </View>

        {/* Badge Grid */}
        {filteredAndSortedBadges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Award size={48} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No badges found
            </Text>
          </View>
        ) : (
          <View style={styles.badgeGrid}>
            {filteredAndSortedBadges.map((badge) => (
              <BadgeCard
                key={badge.badgeId}
                badge={badge}
                onPress={() => setSelectedBadge(badge)}
                isDark={isDark}
                theme={theme}
              />
            ))}
      </View>
        )}
    </ScrollView>

      {/* Badge Detail Modal */}
      <BadgeDetailModal
        badge={selectedBadge}
        visible={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
        isDark={isDark}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loader: {
    marginTop: 100,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressHeader: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  sortText: {
    fontSize: 14,
    flex: 1,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  badgeIconContainer: {
    marginBottom: 8,
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    minHeight: 36,
  },
  badgeNameEarned: {
    fontWeight: '700',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  earnedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    minHeight: 22,
    justifyContent: 'center',
  },
  earnedText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  lockedText: {
    fontSize: 11,
    marginTop: 4,
  },
  progressContainer: {
    width: '100%',
    marginTop: 8,
    minHeight: 22,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  modalBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalBadgeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalBadgeName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalSectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalSectionSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  modalPointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalPointsValue: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalProgressContainer: {
    marginTop: 8,
  },
  modalProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  modalTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
