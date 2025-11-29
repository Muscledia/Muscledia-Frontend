// app/(tabs)/index.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCharacter } from '@/hooks/useCharacter';
import { useAuth } from '@/hooks/useAuth';
import ProgressBar from '@/components/ProgressBar';
import {
  Coins,
  Pen,
  Compass,
  ChevronDown,
  ChevronRight,
  FileText,
  Search,
  MoreVertical,
  Share2,
  Copy,
  Edit2,
  Trash2,
  X,
} from 'lucide-react-native';
import { getGreeting } from '@/utils/helpers';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useRoutines } from '@/hooks/useRoutines';
import { getThemeColors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useHaptics } from '@/hooks/useHaptics';
import { RoutineService } from '@/services';
import { RoutineFolder, WorkoutPlan } from '@/types/api';

export default function HomeScreen() {
  const { character } = useCharacter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const [greeting, setGreeting] = useState('');
  const { workouts } = useWorkouts();
  const { routines: localRoutines } = useRoutines();
  const router = useRouter();
  const { impact } = useHaptics();

  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  // State for API-based routines
  const [savedRoutines, setSavedRoutines] = useState<RoutineFolder[]>([]);
  const [loadingRoutines, setLoadingRoutines] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRoutines, setExpandedRoutines] = useState<Set<string>>(new Set());

  // Modal state
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<RoutineFolder | null>(null);

  useEffect(() => {
    setGreeting(getGreeting());
    fetchSavedRoutines();
  }, []);

  // Fetch saved routines from API
  const fetchSavedRoutines = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoadingRoutines(true);
      setError(null);

      const response = await RoutineService.getPersonalRoutineFolders();

      if (response.success && response.data) {
        setSavedRoutines(response.data);
        console.log('Loaded', response.data.length, 'saved routines from API');
      } else {
        setError(response.message || 'Failed to load routines');
      }
    } catch (err: any) {
      console.error('Error fetching saved routines:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoadingRoutines(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedRoutines(true);
  };

  // Toggle routine folder expanded state
  const toggleRoutineExpanded = async (routineId: string) => {
    await impact('light');
    setExpandedRoutines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(routineId)) {
        newSet.delete(routineId);
      } else {
        newSet.add(routineId);
      }
      return newSet;
    });
  };

  // Show folder options menu
  const showFolderOptions = async (routine: RoutineFolder) => {
    await impact('light');
    setSelectedFolder(routine);
    setShowFolderMenu(true);
  };

  // Close folder menu
  const closeFolderMenu = async () => {
    await impact('light');
    setShowFolderMenu(false);
    setTimeout(() => setSelectedFolder(null), 300);
  };

  // Remove folder from saved collection
  const handleRemoveFolder = async () => {
    if (!selectedFolder) return;

    await impact('warning');
    closeFolderMenu();

    Alert.alert(
      'Remove Routine Folder',
      `Are you sure you want to remove "${selectedFolder.title}" from your collection?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: async () => await impact('light'),
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await impact('heavy');
            // TODO: Implement backend API call to remove folder
            // await RoutineService.removePersonalRoutine(selectedFolder.id);

            // For now, just remove from local state
            setSavedRoutines(prev => prev.filter(r => r.id !== selectedFolder.id));

            console.log('TODO: Implement DELETE /api/v1/routine-folders/{id} endpoint');
            Alert.alert('Success', 'Routine folder removed from your collection');
          },
        },
      ]
    );
  };

  // Duplicate folder (placeholder)
  const handleDuplicateFolder = async () => {
    await impact('light');
    closeFolderMenu();
    Alert.alert('Coming Soon', 'Duplicate routine functionality will be implemented soon');
  };

  // Share folder (placeholder)
  const handleShareFolder = async () => {
    await impact('light');
    closeFolderMenu();
    Alert.alert('Coming Soon', 'Share routine functionality will be implemented soon');
  };

  // Workout Plan Card Component
  const WorkoutPlanCard = ({
                             workoutPlan,
                             routine
                           }: {
    workoutPlan: WorkoutPlan;
    routine: RoutineFolder;
  }) => {
    const getExercisePreview = () => {
      if (!workoutPlan.exercises || workoutPlan.exercises.length === 0) {
        return 'No exercises';
      }

      return workoutPlan.exercises
        .slice(0, 4)
        .map(ex => ex.title)
        .join(', ');
    };

    return (
      <View style={styles.workoutPlanCard}>
        {/* Make the card clickable to view details */}
        <TouchableOpacity
          onPress={async () => {
            await impact('medium');
            router.push({
              pathname: `/workout-plan-detail/${workoutPlan.id}`,
              params: { initialData: JSON.stringify(workoutPlan) }
            });
          }}
          activeOpacity={0.9}
        >
          {/* Workout Plan Title & Menu */}
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
              {workoutPlan.title}
            </Text>
            <TouchableOpacity
              onPress={async (e) => {
                e.stopPropagation();
                await impact('light');
                // TODO: Show workout plan options menu
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreVertical size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Exercise Preview */}
          <Text style={[styles.exerciseText, { color: theme.textSecondary }]} numberOfLines={2}>
            {getExercisePreview()}
          </Text>
        </TouchableOpacity>

        {/* Start Workout Button */}
        <TouchableOpacity
          onPress={async (e) => {
            e.stopPropagation();
            await impact('medium');
            router.push({
              pathname: `/workout-session/${workoutPlan.id}`,
              params: { initialData: JSON.stringify(workoutPlan) }
            });
          }}
          activeOpacity={0.9}
          style={styles.startButton}
        >
          <LinearGradient
            colors={[theme.accent, theme.accentSecondary]}
            locations={[0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startGradient}
          >
            <Text style={[styles.startText, { color: theme.cardText }]}>Start Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  // Routine Folder Component
  const RoutineFolderSection = ({ routine }: { routine: RoutineFolder }) => {
    const isExpanded = expandedRoutines.has(routine.id);
    const workoutPlans = routine.workoutPlans || [];

    return (
      <View style={styles.routineSection}>
        {/* Folder Header */}
        <TouchableOpacity
          onPress={() => toggleRoutineExpanded(routine.id)}
          activeOpacity={0.7}
          style={styles.folderHeader}
        >
          <View style={styles.folderHeaderLeft}>
            {isExpanded ? (
              <ChevronDown size={20} color={theme.textMuted} />
            ) : (
              <ChevronRight size={20} color={theme.textMuted} />
            )}
            <View style={styles.folderInfo}>
              <Text style={[styles.folderTitle, { color: theme.text }]}>
                {routine.title}
              </Text>
              <Text style={[styles.folderSubtitle, { color: theme.textMuted }]}>
                ({workoutPlans.length})
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              showFolderOptions(routine);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Workout Plans - Show all when expanded */}
        {isExpanded && workoutPlans.map((plan) => (
          <WorkoutPlanCard
            key={plan.id}
            workoutPlan={plan}
            routine={routine}
          />
        ))}
      </View>
    );
  };

  const totalRoutines = savedRoutines.length + localRoutines.length;

  return (
    <View style={styles.container}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: theme.text }]}>Muscledia</Text>
          <View style={styles.coinContainer}>
            <Coins size={20} color={theme.accent} />
            <Text style={[styles.coinText, { color: theme.accent }]}>100</Text>
          </View>
        </View>

        {/* Character Section */}
        <View style={[styles.characterSection, { backgroundColor: theme.surface }]}>
          <View style={styles.characterImageContainer}>
            <TouchableOpacity
              onPress={async () => { await impact('selection'); router.push('/customize'); }}
              style={styles.customizeBtn}
              activeOpacity={0.9}
            >
              <View style={[styles.customizeBtnInner, { backgroundColor: theme.accent }]}>
                <Pen size={16} color={theme.cardText} />
              </View>
            </TouchableOpacity>
            {character.characterBackgroundUrl && (
              <Image
                source={{ uri: character.characterBackgroundUrl }}
                style={styles.backgroundImage}
                resizeMode="cover"
              />
            )}
            <Image
              source={require('../../assets/images/muscledia_guy.png')}
              style={styles.characterImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.barsContainer}>
            <View style={styles.barRow}>
              <Text style={[styles.barLeftLabel, { color: theme.text }]}>
                {character.currentHealth}/{character.maxHealth}
              </Text>
              <View style={{ flex: 1 }}>
                <ProgressBar
                  progress={Math.max(0, Math.min(1, character.currentHealth / character.maxHealth || 0))}
                  color={theme.health}
                  height={10}
                />
              </View>
              <Text style={[styles.barRightLabel, { color: theme.textSecondary }]}>Health</Text>
            </View>
            <View style={styles.barRow}>
              <Text style={[styles.barLeftLabel, { color: theme.text }]}>
                {character.xp}/{character.xpToNextLevel}
              </Text>
              <View style={{ flex: 1 }}>
                <ProgressBar
                  progress={Math.max(0, Math.min(1, character.xp / character.xpToNextLevel || 0))}
                  color={theme.xp}
                  height={10}
                />
              </View>
              <Text style={[styles.barRightLabel, { color: theme.textSecondary }]}>Level {character.level}</Text>
            </View>
          </View>
        </View>

        {/* Routines Section Header */}
        <View style={styles.routinesHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Routines</Text>
          <TouchableOpacity
            onPress={async () => {
              await impact('light');
              router.push('/public-routines');
            }}
            style={styles.exploreBadge}
          >
            <Compass size={16} color={theme.accent} />
            <Text style={[styles.exploreText, { color: theme.accent }]}>Explore</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
            onPress={async () => { await impact('medium'); router.push('/routine-builder'); }}
            activeOpacity={0.9}
          >
            <FileText size={18} color={theme.text} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>New Routine</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
            onPress={async () => { await impact('medium'); router.push('/public-routines'); }}
            activeOpacity={0.9}
          >
            <Search size={18} color={theme.text} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>Explore</Text>
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {loadingRoutines ? (
          <View style={[styles.loadingContainer, { backgroundColor: theme.surface }]}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : error ? (
          /* Error State */
          <View style={[styles.errorContainer, { backgroundColor: theme.surface }]}>
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            <TouchableOpacity
              onPress={() => fetchSavedRoutines()}
              style={[styles.retryButton, { backgroundColor: theme.accent }]}
            >
              <Text style={[styles.retryButtonText, { color: theme.cardText }]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : totalRoutines === 0 ? (
          /* Empty State */
          <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No routines yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Create a routine or explore pre-made ones
            </Text>
          </View>
        ) : (
          <>
            {/* Saved Routine Folders - Show ALL workout plans */}
            {savedRoutines.map((routine) => (
              <RoutineFolderSection key={routine.id} routine={routine} />
            ))}

            {/* Local Routines (if any) */}
            {localRoutines.map((routine) => (
              <RoutineFolderSection
                key={`local-${routine.id}`}
                routine={routine as any}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Folder Options Modal */}
      <Modal
        visible={showFolderMenu}
        animationType="slide"
        transparent={true}
        onRequestClose={closeFolderMenu}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeFolderMenu}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {selectedFolder?.title}
              </Text>
              <TouchableOpacity onPress={closeFolderMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Menu Options */}
            <View style={styles.menuOptions}>
              <TouchableOpacity
                style={[styles.menuOption, { borderBottomColor: theme.surface }]}
                onPress={handleShareFolder}
                activeOpacity={0.7}
              >
                <Share2 size={20} color={theme.text} />
                <Text style={[styles.menuOptionText, { color: theme.text }]}>
                  Share Routine
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuOption, { borderBottomColor: theme.surface }]}
                onPress={handleDuplicateFolder}
                activeOpacity={0.7}
              >
                <Copy size={20} color={theme.text} />
                <Text style={[styles.menuOptionText, { color: theme.text }]}>
                  Duplicate Routine
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuOption, { borderBottomColor: theme.surface }]}
                onPress={async () => {
                  await impact('light');
                  closeFolderMenu();
                  Alert.alert('Coming Soon', 'Edit routine functionality will be implemented soon');
                }}
                activeOpacity={0.7}
              >
                <Edit2 size={20} color={theme.text} />
                <Text style={[styles.menuOptionText, { color: theme.text }]}>
                  Edit Routine
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuOption}
                onPress={handleRemoveFolder}
                activeOpacity={0.7}
              >
                <Trash2 size={20} color={theme.error} />
                <Text style={[styles.menuOptionText, { color: theme.error }]}>
                  Remove from Saved
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  characterSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  characterImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 468,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    opacity: 0.6,
  },
  characterImage: {
    width: 370,
    height: 392,
  },
  barsContainer: {
    width: '100%',
    marginTop: 8,
    alignItems: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    width: '100%',
    maxWidth: 420,
  },
  barLeftLabel: {
    width: 100,
    fontSize: 12,
    textAlign: 'left',
  },
  barRightLabel: {
    width: 60,
    fontSize: 12,
    textAlign: 'right',
  },
  customizeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2
  },
  customizeBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10
  },
  routinesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  exploreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  exploreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Routine Folder Section
  routineSection: {
    marginBottom: 16,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  folderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  folderInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  folderTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  folderSubtitle: {
    fontSize: 13,
  },
  // Workout Plan Card
  workoutPlanCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  exerciseText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  startButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  startGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  startText: {
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  errorContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  menuOptions: {
    paddingTop: 8,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
