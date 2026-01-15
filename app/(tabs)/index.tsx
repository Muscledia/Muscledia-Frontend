import React, { useState, useCallback, useRef } from 'react';
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
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCharacter } from '@/hooks/useCharacter';
import { useAuth } from '@/hooks/useAuth';
import ProgressBar from '@/components/ProgressBar';
import {
  Coins,
  Pen,
  ChevronDown,
  ChevronRight,
  FileText,
  Search,
  MoreVertical,
  Copy,
  Edit2,
  Trash2,
  X,
  FolderEdit,
  Compass,
  Sparkles,
  Trophy,
  Dumbbell,
} from 'lucide-react-native';
import { getGreeting } from '@/utils/helpers';
import { useRoutines } from '@/hooks/useRoutines';
import { getThemeColors } from '@/constants/Colors';
// FIX: Import useFocusEffect
import { useRouter, useFocusEffect } from 'expo-router';
import { useHaptics } from '@/hooks/useHaptics';
import { RoutineService, WorkoutService, WorkoutPlanService } from '@/services';
import { RoutineFolder, WorkoutPlan } from '@/types';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { CharacterDisplay } from '@/components/CharacterDisplay';

export default function HomeScreen() {
  const { character } = useCharacter();
  const performOptimistic = useOptimisticUpdate<RoutineFolder[]>();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const [greeting, setGreeting] = useState('');
  const { routines: localRoutines } = useRoutines();
  const router = useRouter();
  const { impact } = useHaptics();

  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  const [savedRoutines, setSavedRoutines] = useState<RoutineFolder[]>([]);
  const [personalPlans, setPersonalPlans] = useState<WorkoutPlan[]>([]);
  const [loadingRoutines, setLoadingRoutines] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRoutines, setExpandedRoutines] = useState<Set<string>>(new Set());
  const [expandedMyPlans, setExpandedMyPlans] = useState<boolean>(true);

  // Ref to track if we've loaded data initially (to prevent spinner flash on focus)
  const hasLoadedRef = useRef(false);

  const [activeMenu, setActiveMenu] = useState<'folder' | 'plan' | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<RoutineFolder | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // FIX: Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setGreeting(getGreeting());
      fetchSavedRoutines();
      fetchPersonalPlans();
    }, [])
  );

  const fetchSavedRoutines = async (isRefreshing = false) => {
    try {
      // Only show full loading spinner if it's the first load or explicit refresh
      // If we already have data (returning to screen), we do a "silent" update
      if (!isRefreshing && !hasLoadedRef.current) {
        setLoadingRoutines(true);
      }

      setError(null);
      const response = await RoutineService.getPersonalRoutineFolders();

      if (response.success && response.data) {
        setSavedRoutines(response.data);
        hasLoadedRef.current = true; // Mark as loaded so we don't show spinner again on focus
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

  const fetchPersonalPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await WorkoutPlanService.getPersonalCustomWorkoutPlans();
      if (response.success && response.data) {
        setPersonalPlans(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching personal plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Force spinner on pull-to-refresh
    fetchSavedRoutines(true);
    fetchPersonalPlans();
  };

  const toggleRoutineExpanded = async (routineId: string) => {
    await impact('light');
    setExpandedRoutines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(routineId)) newSet.delete(routineId);
      else newSet.add(routineId);
      return newSet;
    });
  };

  const openFolderMenu = (routine: RoutineFolder) => {
    setSelectedFolder(routine);
    setActiveMenu('folder');
  };

  const openPlanMenu = (plan: WorkoutPlan, folder?: RoutineFolder) => {
    setSelectedPlan(plan);
    setSelectedFolder(folder || null);
    setActiveMenu('plan');
  };

  const closeMenu = () => {
    setActiveMenu(null);
    setTimeout(() => {
      if (!renameModalVisible) {
        setSelectedFolder(null);
        setSelectedPlan(null);
      }
    }, 300);
  };

  const handleOpenRenameModal = () => {
    if (!selectedFolder) return;
    setNewFolderName(selectedFolder.title);
    setActiveMenu(null);
    setRenameModalVisible(true);
  };

  const handleStartEmptyWorkout = async () => {
    try {
      await impact('medium');
      const response = await WorkoutService.startEmptyWorkout({
        workoutName: "Quick Workout",
        workoutType: "STRENGTH",
        location: "Gym",
      });
      
      if (response.success && response.data) {
            router.push({
              pathname: '/workout-session/[planId]' as any,
              params: { planId: response.data.id, isExistingSession: 'true' }
            });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start workout');
    }
  };

  // OPTIMISTIC RENAME
  const performRename = async () => {
    if (!selectedFolder || !newFolderName.trim()) return;

    const targetId = selectedFolder.id;
    const newTitle = newFolderName.trim();

    await performOptimistic(
      savedRoutines,
      savedRoutines.map(r => r.id === targetId ? { ...r, title: newTitle } : r),
      setSavedRoutines,
      () => RoutineService.updatePersonalRoutine(targetId, { title: newTitle })
    );

    setRenameModalVisible(false);
  };

  // OPTIMISTIC REMOVE PLAN
  const handleRemovePlanFromFolder = async () => {
    if (!selectedPlan || !selectedFolder) return;

    Alert.alert('Remove from Folder', `Remove "${selectedPlan.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await performOptimistic(
            savedRoutines,
            savedRoutines.map(folder =>
              folder.id === selectedFolder.id
                ? { ...folder, workoutPlans: folder.workoutPlans?.filter(p => p.id !== selectedPlan.id) || [] }
                : folder
            ),
            setSavedRoutines,
            () => RoutineService.removeWorkoutPlanFromRoutine(selectedFolder.id, selectedPlan.id)
          );
          setActiveMenu(null);
        }
      }
    ]);
  };

  // OPTIMISTIC DELETE FOLDER
  const handleRemoveFolder = async () => {
    if (!selectedFolder) return;

    Alert.alert('Delete Folder', `Delete "${selectedFolder.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await performOptimistic(
            savedRoutines,
            savedRoutines.filter(r => r.id !== selectedFolder.id),
            setSavedRoutines,
            () => RoutineService.deletePersonalRoutine(selectedFolder.id)
          );
          setActiveMenu(null);
        },
      },
    ]);
  };

  // DELETE PLAN FROM MY PLANS
  const handleDeletePlan = async () => {
    if (!selectedPlan) return;

    Alert.alert('Delete Plan', `Delete "${selectedPlan.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await WorkoutPlanService.deleteWorkoutPlan(selectedPlan.id);
            if (response.success) {
              setPersonalPlans(prev => prev.filter(p => p.id !== selectedPlan.id));
              setActiveMenu(null);
            } else {
              Alert.alert('Error', response.message || 'Failed to delete plan');
            }
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete plan');
          }
        },
      },
    ]);
  };


  const WorkoutPlanCard = ({ workoutPlan, routine }: { workoutPlan: WorkoutPlan; routine?: RoutineFolder }) => {
    const getExercisePreview = () => {
      if (!workoutPlan.exercises || workoutPlan.exercises.length === 0) return 'No exercises';
      return workoutPlan.exercises.slice(0, 4).map(ex => ex.title).join(', ');
    };

    return (
      <View style={styles.workoutPlanCard}>
        <TouchableOpacity
          onPress={async () => {
            await impact('medium');
            router.push({
              pathname: '/workout-plan-detail/[planId]' as any,
              params: {
                planId: workoutPlan.id,
                initialData: JSON.stringify(workoutPlan),
                isPublic: 'false' // CRITICAL: Personal workout plan flag
              }
            });
          }}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
              {workoutPlan.title}
            </Text>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                openPlanMenu(workoutPlan, routine);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreVertical size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.exerciseText, { color: theme.textSecondary }]} numberOfLines={2}>
            {getExercisePreview()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async (e) => {
            e.stopPropagation();
            await impact('medium');
            router.push({
              pathname: '/workout-session/[planId]' as any,
              params: { planId: workoutPlan.id, initialData: JSON.stringify(workoutPlan) }
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

  const RoutineFolderSection = ({ routine }: { routine: RoutineFolder }) => {
    const isExpanded = expandedRoutines.has(routine.id);
    const workoutPlans = routine.workoutPlans || [];

    return (
      <View style={styles.routineSection}>
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
              openFolderMenu(routine);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </TouchableOpacity>

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
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: theme.text }]}>Muscledia</Text>
          <View style={styles.coinContainer}>
            <Coins size={20} color={theme.accent} />
            <Text style={[styles.coinText, { color: theme.accent }]}>{character.coins}</Text>
          </View>
        </View>

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
            {/* Wrapper to contain z-indexed layers properly */}
            {/* Using 2x scale: 151x221 -> 302x442 to prevent blur */}
            <View style={{ width: 302, height: 442, zIndex: 1 }}>
              <CharacterDisplay
                level={character.level}
                skinColor={character.skinColor}
                equippedShirt={character.equippedShirt}
                equippedPants={character.equippedPants}
                equippedEquipment={character.equippedEquipment}
                equippedAccessory={character.equippedAccessory}
                characterBackgroundUrl={character.characterBackgroundUrl}
                style={{ width: '100%', height: '100%' }}
                imageStyle={{ width: '100%', height: '100%' }}
              />
            </View>
          </View>
          <View style={styles.barsContainer}>
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

        {/* Leaderboard Button */}
        <TouchableOpacity
          style={[styles.leaderboardButton, { backgroundColor: theme.surface }]}
          onPress={async () => {
            await impact('medium');
            router.push('/leaderboard');
          }}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[theme.accent, theme.accentSecondary]}
            locations={[0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.leaderboardGradient}
          >
            <Trophy size={20} color={theme.cardText} />
            <Text style={[styles.leaderboardButtonText, { color: theme.cardText }]}>
              View Leaderboard
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.routinesHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Routines</Text>
          <TouchableOpacity
            onPress={async () => { await impact('light'); router.push('/public-routines'); }}
            style={styles.exploreBadge}
          >
            <Compass size={16} color={theme.accent} />
            <Text style={[styles.exploreText, { color: theme.accent }]}>Explore</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtonsGrid}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.surface }]}
              onPress={handleStartEmptyWorkout}
              activeOpacity={0.9}
            >
              <Dumbbell size={18} color={theme.accent} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>Quick Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.surface }]}
              onPress={async () => { await impact('medium'); router.push('/routine-builder' as any); }}
              activeOpacity={0.9}
            >
              <FileText size={18} color={theme.text} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>New Routine</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.surface }]}
              onPress={async () => { await impact('medium'); router.push('/public-routines'); }}
              activeOpacity={0.9}
            >
              <Search size={18} color={theme.text} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>Explore</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.surface }]}
              onPress={async () => { 
                await impact('medium'); 
                router.push('/ai-recommendation'); 
              }}
              activeOpacity={0.9}
            >
              <Sparkles size={18} color={theme.text} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>AI Coach</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loadingRoutines ? (
          <View style={[styles.loadingContainer, { backgroundColor: theme.surface }]}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : error ? (
          <View style={[styles.errorContainer, { backgroundColor: theme.surface }]}>
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            <TouchableOpacity onPress={() => fetchSavedRoutines()} style={[styles.retryButton, { backgroundColor: theme.accent }]}>
              <Text style={[styles.retryButtonText, { color: theme.cardText }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : totalRoutines === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No routines yet</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Create a routine or explore pre-made ones</Text>
          </View>
        ) : (
          <>
            {savedRoutines.map((routine) => (
              <RoutineFolderSection key={routine.id} routine={routine} />
            ))}

            {/* My Plans Folder */}
            {personalPlans.length > 0 && (
              <View style={styles.routineSection}>
                <TouchableOpacity
                  onPress={async () => {
                    await impact('light');
                    setExpandedMyPlans(!expandedMyPlans);
                  }}
                  activeOpacity={0.7}
                  style={styles.folderHeader}
                >
                  <View style={styles.folderHeaderLeft}>
                    {expandedMyPlans ? (
                      <ChevronDown size={20} color={theme.textMuted} />
                    ) : (
                      <ChevronRight size={20} color={theme.textMuted} />
                    )}
                    <View style={styles.folderInfo}>
                      <Text style={[styles.folderTitle, { color: theme.text }]}>
                        My Plans
                      </Text>
                      <Text style={[styles.folderSubtitle, { color: theme.textMuted }]}>
                        ({personalPlans.length})
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {expandedMyPlans && personalPlans.map((plan) => (
                  <WorkoutPlanCard
                    key={plan.id}
                    workoutPlan={plan}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* MENU MODAL */}
      <Modal
        visible={activeMenu !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={closeMenu}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeMenu}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {activeMenu === 'folder' ? selectedFolder?.title : selectedPlan?.title}
              </Text>
              <TouchableOpacity onPress={closeMenu}>
                <X size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuOptions}>
              {activeMenu === 'folder' && (
                <>
                  <TouchableOpacity style={styles.menuOption} onPress={handleOpenRenameModal}>
                    <FolderEdit size={20} color={theme.text} />
                    <Text style={[styles.menuOptionText, { color: theme.text }]}>Rename Title</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuOption} onPress={() => { /* Duplicate logic */ }}>
                    <Copy size={20} color={theme.text} />
                    <Text style={[styles.menuOptionText, { color: theme.text }]}>Duplicate Routine</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuOption} onPress={handleRemoveFolder}>
                    <Trash2 size={20} color={theme.error} />
                    <Text style={[styles.menuOptionText, { color: theme.error }]}>Delete Folder</Text>
                  </TouchableOpacity>
                </>
              )}

              {activeMenu === 'plan' && (
                <>
                  <TouchableOpacity style={styles.menuOption} onPress={() => {
                    if (selectedPlan) {
                      closeMenu();
                      router.push(`/workout-plans/${selectedPlan.id}/edit`);
                    }
                  }}>
                    <Edit2 size={20} color={theme.text} />
                    <Text style={[styles.menuOptionText, { color: theme.text }]}>Edit Plan</Text>
                  </TouchableOpacity>
                  {selectedFolder ? (
                    <TouchableOpacity style={styles.menuOption} onPress={handleRemovePlanFromFolder}>
                      <Trash2 size={20} color={theme.error} />
                      <Text style={[styles.menuOptionText, { color: theme.error }]}>
                        Remove from "{selectedFolder?.title}"
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.menuOption} onPress={handleDeletePlan}>
                      <Trash2 size={20} color={theme.error} />
                      <Text style={[styles.menuOptionText, { color: theme.error }]}>
                        Delete Plan
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* RENAME MODAL */}
      <Modal
        visible={renameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.renameModalOverlay}
        >
          <View style={[styles.renameCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.renameTitle, { color: theme.text }]}>Rename Folder</Text>
            <TextInput
              style={[styles.renameInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
              placeholder="Folder Name"
              placeholderTextColor={theme.textMuted}
            />
            <View style={styles.renameActions}>
              <TouchableOpacity
                style={styles.renameBtn}
                onPress={() => setRenameModalVisible(false)}
              >
                <Text style={[styles.renameBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.renameBtn, { backgroundColor: theme.accent }]}
                onPress={performRename}
              >
                <Text style={[styles.renameBtnText, { color: theme.cardText }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  appTitle: { fontSize: 20, fontWeight: 'bold' },
  coinContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  coinText: { fontSize: 16, fontWeight: 'bold' },
  characterSection: { borderRadius: 16, padding: 20, marginBottom: 20, alignItems: 'center' },
  characterImageContainer: { alignItems: 'center', justifyContent: 'center', width: '100%', height: 468 },
  backgroundImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12, opacity: 0.6 },
  characterImage: { width: 370, height: 392 },
  barsContainer: { width: '100%', marginTop: 8, alignItems: 'center' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, width: '100%', maxWidth: 420 },
  barLeftLabel: { width: 100, fontSize: 12, textAlign: 'left' },
  barRightLabel: { width: 60, fontSize: 12, textAlign: 'right' },
  customizeBtn: { position: 'absolute', top: 12, right: 12, zIndex: 100, elevation: 100 },
  customizeBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10 },
  leaderboardButton: { borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  leaderboardGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 20 },
  leaderboardButtonText: { fontSize: 16, fontWeight: '700' },
  routinesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  exploreBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6 },
  exploreText: { fontSize: 14, fontWeight: '600' },
  actionButtonsGrid: { gap: 12, marginBottom: 20 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  actionButtonText: { fontSize: 14, fontWeight: '600' },
  routineSection: { marginBottom: 16 },
  folderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 4, marginBottom: 8 },
  folderHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  folderInfo: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  folderTitle: { fontSize: 15, fontWeight: '500' },
  folderSubtitle: { fontSize: 13 },
  workoutPlanCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: '600', flex: 1 },
  exerciseText: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  startButton: { borderRadius: 8, overflow: 'hidden' },
  startGradient: { paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  startText: { fontSize: 15, fontWeight: '600' },
  loadingContainer: { padding: 32, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  errorContainer: { padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  errorText: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { fontSize: 14, fontWeight: 'bold' },
  emptyState: { padding: 40, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  modalTitle: { fontSize: 18, fontWeight: '600', flex: 1 },
  menuOptions: { paddingTop: 8 },
  menuOption: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  menuOptionText: { fontSize: 16, fontWeight: '500' },
  renameModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  renameCard: { width: '100%', borderRadius: 16, padding: 20 },
  renameTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  renameInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
  renameActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  renameBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  renameBtnText: { fontWeight: '600', fontSize: 15 },
});
