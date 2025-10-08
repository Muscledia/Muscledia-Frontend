import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
  Alert,
  Linking,
  Platform,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useCharacter } from '@/hooks/useCharacter';
import { useAuth } from '@/hooks/useAuth';
import CharacterAvatar from '@/components/CharacterAvatar';
import ProgressBar from '@/components/ProgressBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useLeagues } from '@/hooks/useLeagues';
import { useHaptics } from '@/hooks/useHaptics';
import { ArrowLeft, Heart, Star, Settings, Bell, HelpCircle, LogOut, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
 
import { useNotifications } from '@/hooks/useNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWorkouts } from '@/hooks/useWorkouts';

export default function ProfileScreen() {
  const { character, updateCharacter } = useCharacter();
  const { logout, user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { workouts, loading: workoutsLoading } = useWorkouts();
  // Compute user initials for default avatar
  const displayName = user?.email?.split('@')[0] || 'User';
  const initials = (() => {
    const parts = displayName.split(/[^A-Za-z0-9]+/).filter(Boolean);
    if (parts.length === 0) return (displayName[0] || 'U').toUpperCase();
    const letters = parts.slice(0, 2).map(p => p[0].toUpperCase()).join('');
    return letters || (displayName[0] || 'U').toUpperCase();
  })();
  const { state: leagues, currentDivision, nextDivision, progressToNext, claimPendingReward, daysUntilReset } = useLeagues();
  const { impact } = useHaptics();
  const { isGranted, requestPermission, scheduleInSeconds, scheduleDailyReminder, cancelAll } = useNotifications();

  const [notifEnabled, setNotifEnabled] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

  const changeMonth = (delta: number) => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + delta);
    setCurrentMonth(next);
  };

  const getMonthGrid = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = firstOfMonth.getDay(); // 0=Sun..6=Sat
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = 42; // 6 weeks
    const cells: Array<{ inMonth: boolean; date?: Date; dayNum?: number }> = [];
    // Leading blanks
    for (let i = 0; i < firstDayOfWeek; i++) cells.push({ inMonth: false });
    // Month days
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ inMonth: true, date: new Date(year, month, day), dayNum: day });
    }
    // Trailing blanks
    while (cells.length < totalCells) cells.push({ inMonth: false });
    return cells;
  };

  // Build a map of dates with workouts
  const workoutDatesSet = React.useMemo(() => {
    const set = new Set<string>();
    workouts.forEach(w => {
      const d = new Date(w.timestamp);
      set.add(formatDate(d));
    });
    return set;
  }, [workouts]);

  const selectedWorkouts = React.useMemo(() => {
    return workouts.filter(w => formatDate(new Date(w.timestamp)) === selectedDate);
  }, [workouts, selectedDate]);

  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('notifications_enabled');
      setNotifEnabled(stored === 'true');
    })();
  }, []);

  const toggleNotifications = async () => {
    const next = !notifEnabled;
    setNotifEnabled(next);
    await AsyncStorage.setItem('notifications_enabled', next ? 'true' : 'false');
    if (next) {
      const ok = isGranted ?? await requestPermission();
      if (!ok) return;
      await impact('success');
      await scheduleDailyReminder(9, 0);
    } else {
      await impact('warning');
      await cancelAll();
    }
  };

  // Derived progress values with guards to avoid NaN/Infinity
  const healthProgress = character.maxHealth > 0
    ? Math.min(Math.max(character.currentHealth / character.maxHealth, 0), 1)
    : 0;
  const xpProgress = character.xpToNextLevel > 0
    ? Math.min(Math.max(character.xp / character.xpToNextLevel, 0), 1)
    : 0;

  const strength = Math.min(999, Math.floor(character.totalXP / 50) + character.level * 2);
  const stamina = Math.min(999, character.maxHealth + character.level * 3);
  const agility = Math.min(999, 50 + character.level * 2);
  const focus = Math.min(999, 30 + Math.floor(character.streak * 1.5));
  const luck = Math.min(999, 10 + Math.floor(character.level / 2));

  const attributes = [
    { name: 'Strength', value: strength.toString() },
    { name: 'Stamina', value: stamina.toString() },
    { name: 'Agility', value: agility.toString() },
    { name: 'Focus', value: focus.toString() },
    { name: 'Luck', value: luck.toString() },
    { name: 'Level', value: character.level.toString() },
  ];

  const skills = [
    { name: 'SKILL_NAME1', info: 'Skill_info' },
    { name: 'SKILL_NAME1', info: 'Skill_info' },
    { name: 'SKILL_NAME1', info: 'Skill_info' },
    { name: 'SKILL_NAME1', info: 'Skill_info' },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Character Section */}
      <LinearGradient
        colors={[theme.accent, theme.accentSecondary]}
        locations={[0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.characterSection]}
      >
        <View style={styles.topRow}>
          {/* Left: Avatar (no editing) */}
          <View style={styles.avatarContainer}>
            <CharacterAvatar 
              level={character.level} 
              gender={character.gender} 
              streak={character.streak}
              size="large"
              initials={initials}
            />
          </View>

          {/* Right: Username and dates */}
          <View style={styles.identityBlock}>
            <Text style={[styles.identityName, { color: theme.cardText }]}>{user?.email?.split('@')[0] || 'egemenerin'}</Text>
            <Text style={[styles.identityMeta, { color: theme.cardText }]}>Member Since • 2 Jan 2025</Text>
            <Text style={[styles.identityMeta, { color: theme.cardText }]}>Last Login • 26 Mar 2025</Text>
          </View>
        </View>

        <View style={styles.barsContainer}>
          {/* Health Bar */}
          <View style={styles.barItem}>
            <View style={styles.barTitleRow}><Heart size={14} color={theme.cardText} /><Text style={[styles.barLabel, { color: theme.cardText, marginLeft: 6 }]}>Health</Text></View>
            <ProgressBar progress={healthProgress} color={theme.health} height={8} />
            <Text style={[styles.barText, { color: theme.cardText }]}>{character.currentHealth}/{character.maxHealth}</Text>
          </View>
          {/* XP Bar */}
          <View style={styles.barItem}>
            <View style={styles.barTitleRow}><Star size={14} color={theme.cardText} /><Text style={[styles.barLabel, { color: theme.cardText, marginLeft: 6 }]}>Level {character.level}</Text></View>
            <ProgressBar progress={xpProgress} color={theme.xp} height={8} />
            <Text style={[styles.barText, { color: theme.cardText }]}>{character.xp}/{character.xpToNextLevel}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Workout History */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Workout History</Text>
      <View style={[styles.calendarContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={[styles.calendarNavBtn, { borderColor: theme.border }]}> 
            <ChevronLeft size={18} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.calendarTitleRow}>
            <CalendarIcon size={16} color={theme.text} />
            <Text style={[styles.calendarTitle, { color: theme.text }]}>
              {currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => changeMonth(1)} style={[styles.calendarNavBtn, { borderColor: theme.border }]}> 
            <ChevronRight size={18} color={theme.text} />
          </TouchableOpacity>
        </View>
        {/* Weekday labels */}
        <View style={styles.weekRow}>
          {['S','M','T','W','T','F','S'].map((d,i) => (
            <Text key={i} style={[styles.weekLabel, { color: theme.textSecondary }]}>{d}</Text>
          ))}
        </View>
        {/* Days grid */}
        <View style={styles.daysGrid}>
          {getMonthGrid(currentMonth).map((cell, idx) => {
            if (!cell.inMonth) {
              return <View key={idx} style={styles.dayCell} />;
            }
            const dateStr = formatDate(cell.date as Date);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === formatDate(new Date());
            const hasWorkout = workoutDatesSet.has(dateStr);
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayCell,
                  isSelected && { backgroundColor: theme.accent },
                  !isSelected && isToday && { borderColor: theme.accent, borderWidth: 1 },
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text style={[styles.dayNumber, { color: isSelected ? theme.cardText : theme.text }]}>
                  {cell.dayNum}
                </Text>
                {hasWorkout && (
                  <View style={[styles.dayDot, { backgroundColor: isSelected ? theme.cardText : theme.accent }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.calendarLegend}>
          <View style={[styles.legendItem]}>
            <View style={[styles.legendDot, { backgroundColor: theme.accent }]} />
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Workouts</Text>
          </View>
          <View style={[styles.legendItem]}>
            <View style={[styles.legendSquare, { borderColor: theme.accent }]} />
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Today</Text>
          </View>
        </View>
      </View>

      {/* Workouts on selected date */}
      <View style={[styles.infoSection, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Selected Day</Text>
        <Text style={{ color: theme.textSecondary, marginBottom: 8 }}>
          {new Date(selectedDate).toLocaleDateString()}
        </Text>
        {workoutsLoading ? (
          <Text style={{ color: theme.textSecondary }}>Loading...</Text>
        ) : selectedWorkouts.length === 0 ? (
          <Text style={{ color: theme.textSecondary }}>No workouts on this day.</Text>
        ) : (
          <View style={styles.workoutList}>
            {selectedWorkouts.map((w, i) => (
              <View key={`${w.timestamp}-${i}`} style={[styles.workoutItem, { borderColor: theme.border }]}> 
                <View style={{ flex: 1 }}>
                  <Text style={[styles.workoutName, { color: theme.text }]} numberOfLines={1}>{w.name}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    {w.sets} sets
                  </Text>
                  {Array.isArray((w as any).details) && (w as any).details.length > 0 && (
                    <View style={{ marginTop: 6, gap: 6 }}>
                      {(w as any).details.map((ex: any) => (
                        <View key={ex.exerciseId}>
                          <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>{ex.name}</Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                            {ex.sets.map((s: any, idx: number) => (
                              <View key={s.id || idx} style={{
                                borderWidth: 1,
                                borderColor: theme.border,
                                borderRadius: 8,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                backgroundColor: s.completed ? 'rgba(0,0,0,0.06)' : 'transparent',
                              }}>
                                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                                  #{idx + 1} • {s.weight}kg × {s.reps}{s.completed ? ' ✓' : ''}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginLeft: 8 }}>
                  {new Date(w.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Equipment */}
      <View style={[styles.infoSection, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Equipment</Text>
        <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Shirt</Text><Text style={[styles.infoValue, { color: theme.text }]}>{character.equippedShirt || 'None'}</Text></View>
        <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Pants</Text><Text style={[styles.infoValue, { color: theme.text }]}>{character.equippedPants || 'None'}</Text></View>
        <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Equipment</Text><Text style={[styles.infoValue, { color: theme.text }]}>{character.equippedEquipment || 'None'}</Text></View>
      </View>

      {/* Leagues Section */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Leagues</Text>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={async () => { await impact('selection'); router.push('/leagues'); }}
      >
      <View style={[styles.leaguesCard, { backgroundColor: theme.surface }]}> 
        <Text style={[styles.leagueTitle, { color: theme.text }]}>Current: {currentDivision.name}</Text>
        <Text style={[styles.leagueSub, { color: theme.textSecondary }]}>Month {leagues.monthKey} • Resets in {daysUntilReset}d</Text>
        <View style={styles.leagueRow}>
          <Text style={[styles.leaguePoints, { color: theme.text }]}>{leagues.points} pts</Text>
          <Text style={[styles.leagueNext, { color: theme.textSecondary }]}>
            {nextDivision ? `Next ${nextDivision.name} at ${nextDivision.minPoints}` : 'Top division'}
          </Text>
        </View>
        <View style={[styles.progressBarShell, { backgroundColor: theme.background }]}>
          <View style={[styles.progressBarFill, { width: `${progressToNext * 100}%`, backgroundColor: theme.accent }]} />
        </View>
        {leagues.pendingRewardXp > 0 && (
          <TouchableOpacity
            style={[styles.claimButton]}
            onPress={async () => { await impact('success'); claimPendingReward(); }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.accent, theme.accentSecondary]}
              locations={[0.55, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.claimGradient}
            >
              <Text style={[styles.claimText, { color: theme.cardText }]}>Claim {leagues.pendingRewardXp} XP</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
      </TouchableOpacity>

      {/* Attributes Section */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Attributes</Text>
      <View style={styles.attributesGrid}>
        {attributes.map((attr, index) => (
          <LinearGradient
            key={index}
            colors={[theme.accent, theme.accentSecondary]}
            locations={[0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.attributeCard]}
          >
            <Text style={[styles.attributeName, { color: theme.cardText }]}>{attr.name}</Text>
            <Text style={[styles.attributeValue, { color: theme.cardText }]}>{attr.value}</Text>
          </LinearGradient>
        ))}
      </View>

      {/* Skills removed per request */}

      {/* Settings */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
      <View style={[styles.infoSection, { backgroundColor: theme.surface }]}>
        {/* Profile Settings */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={async () => {
            await impact('selection');
            router.push('/profile-settings');
          }}
          style={styles.settingRow}
        >
          <View style={styles.settingLeft}>
            <Settings size={20} color={theme.text} />
            <Text style={[styles.settingsText, { color: theme.text }]}>Profile Settings</Text>
          </View>
          <Text style={{ color: theme.textSecondary }}>{'›'}</Text>
        </TouchableOpacity>

        {/* Notifications toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Bell size={20} color={theme.text} />
            <Text style={[styles.settingsText, { color: theme.text }]}>Daily Reminder (9:00)</Text>
          </View>
          <Switch value={notifEnabled} onValueChange={toggleNotifications} trackColor={{ true: theme.accent }} />
        </View>

        {/* Test Notification */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={async () => {
            const ok = isGranted ?? await requestPermission();
            if (!ok) return;
            await impact('success');
            await scheduleInSeconds(3, 'Muscledia', 'This is a test notification.');
          }}
          style={styles.settingRow}
        >
          <View style={styles.settingLeft}>
            <Bell size={20} color={theme.text} />
            <Text style={[styles.settingsText, { color: theme.text }]}>Send Test Notification</Text>
          </View>
          <Text style={{ color: theme.textSecondary }}>{'›'}</Text>
        </TouchableOpacity>

        {/* Support */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={async () => {
            await impact('selection');
            const email = 'support@muscledia.app';
            const subject = encodeURIComponent('Support Request');
            const body = encodeURIComponent('Describe your issue here...');
            Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
          }}
          style={styles.settingRow}
        >
          <View style={styles.settingLeft}>
            <HelpCircle size={20} color={theme.text} />
            <Text style={[styles.settingsText, { color: theme.text }]}>Support</Text>
          </View>
          <Text style={{ color: theme.textSecondary }}>{'›'}</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={logout}
        >
          <View style={styles.settingLeft}>
            <LogOut size={20} color={theme.error} />
            <Text style={[styles.settingsText, { color: theme.error }]}>Logout</Text>
          </View>
        </TouchableOpacity>

        {/* Reset Onboarding */}
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={async () => {
            await AsyncStorage.removeItem('onboarding_complete');
            Alert.alert('Onboarding reset', 'Close and reopen the app to see onboarding again.');
          }}
        >
          <View style={styles.settingLeft}>
            <Text style={[styles.settingsText, { color: theme.text }]}>Reset Onboarding</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 60, // Account for no header
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  characterSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'column',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarContainer: {
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 6,
    borderRadius: 16,
  },
  identityBlock: { flex: 1, marginLeft: 16 },
  identityName: { fontSize: 18, fontWeight: '700' },
  identityMeta: { fontSize: 12, marginTop: 4 },
  barsContainer: { flexDirection: 'row', gap: 12, marginTop: 16 },
  barItem: { flex: 1 },
  barTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  barLabel: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  barText: {
    fontSize: 11,
    marginTop: 4,
  },
  infoSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  userInfoMerged: {
    width: '100%',
    marginTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  equipmentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  equipmentType: {
    fontSize: 14,
    marginBottom: 4,
  },
  equipmentStat: {
    fontSize: 12,
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  attributeCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  attributeName: {
    fontSize: 12,
    marginBottom: 4,
  },
  attributeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  skillCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  skillName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  skillInfo: {
    fontSize: 10,
  },
  settingsSection: {
    marginTop: 20,
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingsText: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  leaguesCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  leagueTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  leagueSub: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  leagueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaguePoints: { fontSize: 18, fontWeight: '700' },
  leagueNext: { fontSize: 12 },
  progressBarShell: { height: 8, borderRadius: 6, overflow: 'hidden', marginTop: 10 },
  progressBarFill: { height: '100%', borderRadius: 6 },
  claimButton: { marginTop: 12 },
  claimGradient: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  claimText: { fontWeight: '700' },
  // Calendar styles
  calendarContainer: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  calendarTitle: { fontSize: 14, fontWeight: '700' },
  calendarNavBtn: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  weekLabel: { width: `${100/7}%`, textAlign: 'center', fontSize: 12 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100/7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  dayNumber: { fontSize: 14, fontWeight: '600' },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  calendarLegend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendSquare: { width: 12, height: 12, borderRadius: 4, borderWidth: 1 },
  workoutList: { gap: 8 },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  workoutName: { fontSize: 14, fontWeight: '600' },
}); 