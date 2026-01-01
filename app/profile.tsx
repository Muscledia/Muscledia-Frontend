import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useCharacter } from '@/hooks/useCharacter';
import { useAuth } from '@/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { ArrowLeft, Settings, Bell, HelpCircle, LogOut, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Flame, TrendingUp, Activity } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
 
import { useNotifications } from '@/hooks/useNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarService, CalendarData } from '@/services/CalendarService';
import { GamificationService, StreakInfo } from '@/services/gamificationService';

export default function ProfileScreen() {
  const { character } = useCharacter();
  const { logout, user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();
  const { isGranted, requestPermission, scheduleInSeconds, scheduleDailyReminder, cancelAll } = useNotifications();

  const [notifEnabled, setNotifEnabled] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [calendarLoading, setCalendarLoading] = useState<boolean>(false);
  const [currentMonthCount, setCurrentMonthCount] = useState<number>(0);
  const [monthCountLoading, setMonthCountLoading] = useState<boolean>(false);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [streakLoading, setStreakLoading] = useState<boolean>(false);
  const [selectedDateWorkoutCount, setSelectedDateWorkoutCount] = useState<number>(0);
  const [selectedDateLoading, setSelectedDateLoading] = useState<boolean>(false);

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Load calendar data for current month
  useEffect(() => {
    loadMonthCalendarData(currentMonth);
  }, [currentMonth]);

  // Load current month workout count
  useEffect(() => {
    loadCurrentMonthCount();
  }, []);

  // Load streak information
  useEffect(() => {
    loadStreakInfo();
  }, []);

  // Load workout count for selected date
  useEffect(() => {
    loadSelectedDateWorkoutCount();
  }, [selectedDate]);

  const loadMonthCalendarData = async (date: Date) => {
    try {
      setCalendarLoading(true);
      // Use range endpoint to get workout counts for the month
      const year = date.getFullYear();
      const month = date.getMonth();
      const startOfMonthDate = new Date(year, month, 1);
      const endOfMonthDate = new Date(year, month + 1, 0);
      
      // Format dates as ISO-8601 with time
      const startDateISO = `${startOfMonthDate.getFullYear()}-${String(startOfMonthDate.getMonth() + 1).padStart(2, '0')}-${String(startOfMonthDate.getDate()).padStart(2, '0')}T00:00:00Z`;
      const endDateISO = `${endOfMonthDate.getFullYear()}-${String(endOfMonthDate.getMonth() + 1).padStart(2, '0')}-${String(endOfMonthDate.getDate()).padStart(2, '0')}T23:59:59Z`;

      const response = await CalendarService.getCalendarRange(startDateISO, endDateISO);
      
      if (response.success && response.data) {
        setCalendarData(response.data);
      } else {
        console.error('Failed to load calendar data:', response.message);
        setCalendarData({});
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
      Alert.alert('Error', 'Failed to load calendar data');
      setCalendarData({});
    } finally {
      setCalendarLoading(false);
    }
  };

  const loadCurrentMonthCount = async () => {
    try {
      setMonthCountLoading(true);
      const response = await CalendarService.getCurrentMonthCount();
      
      if (response.success && response.data !== undefined) {
        setCurrentMonthCount(response.data);
      } else {
        console.error('Failed to load current month count:', response.message);
        setCurrentMonthCount(0);
      }
    } catch (error) {
      console.error('Error loading current month count:', error);
      setCurrentMonthCount(0);
    } finally {
      setMonthCountLoading(false);
    }
  };

  const loadStreakInfo = async () => {
    try {
      setStreakLoading(true);
      const response = await GamificationService.getStreaks();
      
      if (response.success && response.data) {
        setStreakInfo(response.data);
      } else {
        console.error('Failed to load streak info:', response.message);
        setStreakInfo(null);
      }
    } catch (error) {
      console.error('Error loading streak info:', error);
      setStreakInfo(null);
    } finally {
      setStreakLoading(false);
    }
  };

  const loadSelectedDateWorkoutCount = async () => {
    try {
      setSelectedDateLoading(true);
      const response = await CalendarService.getDateWorkoutCount(selectedDate);
      
      if (response.success && response.data !== undefined) {
        setSelectedDateWorkoutCount(response.data);
      } else {
        console.error('Failed to load selected date workout count:', response.message);
        setSelectedDateWorkoutCount(0);
      }
    } catch (error) {
      console.error('Error loading selected date workout count:', error);
      setSelectedDateWorkoutCount(0);
    } finally {
      setSelectedDateLoading(false);
    }
  };

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

      {/* Stats Section */}
      <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Activity size={20} color={theme.accent} />
            <Text style={[styles.statValue, { color: theme.text }]}>
              {monthCountLoading ? '...' : currentMonthCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>This Month</Text>
          </View>
          {streakInfo && (
            <>
              <View style={styles.statCard}>
                <Flame size={20} color={theme.accent} />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {streakInfo.weekly.currentStreak}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Week Streak</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp size={20} color={theme.accent} />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {streakInfo.monthly.currentStreak}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Month Streak</Text>
              </View>
            </>
          )}
        </View>
      </View>

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
            const hasWorkout = calendarData[dateStr] !== undefined;
            const workoutCount = calendarData[dateStr] || 0;
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
                  <View style={[styles.dayDot, { backgroundColor: isSelected ? theme.cardText : (workoutCount > 1 ? '#FF9800' : theme.accent) }]} />
                )}
                {workoutCount > 1 && (
                  <Text style={[styles.dayCountBadge, { color: isSelected ? theme.cardText : theme.text }]}>
                    {workoutCount}
                  </Text>
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

      {/* Selected Date Workout Count */}
      <View style={[styles.infoSection, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Selected Date</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Selected date:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {new Date(selectedDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Number of workouts:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {selectedDateLoading ? '...' : selectedDateWorkoutCount}
          </Text>
        </View>
      </View>

      {/* Streak Information */}
      {streakInfo && (
        <View style={[styles.infoSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Streak Information</Text>
          <View style={styles.streakGrid}>
            <View style={styles.streakItem}>
              <Flame size={18} color={theme.accent} />
              <View style={styles.streakContent}>
                <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Current Weekly Streak</Text>
                <Text style={[styles.streakValue, { color: theme.text }]}>{streakInfo.weekly.currentStreak} days</Text>
              </View>
            </View>
            <View style={styles.streakItem}>
              <TrendingUp size={18} color={theme.accent} />
              <View style={styles.streakContent}>
                <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Current Monthly Streak</Text>
                <Text style={[styles.streakValue, { color: theme.text }]}>{streakInfo.monthly.currentStreak} months</Text>
              </View>
            </View>
            <View style={styles.streakItem}>
              <Flame size={18} color={theme.accent} />
              <View style={styles.streakContent}>
                <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Longest Weekly Streak</Text>
                <Text style={[styles.streakValue, { color: theme.text }]}>{streakInfo.weekly.longestStreak} days</Text>
              </View>
            </View>
            <View style={styles.streakItem}>
              <TrendingUp size={18} color={theme.accent} />
              <View style={styles.streakContent}>
                <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Longest Monthly Streak</Text>
                <Text style={[styles.streakValue, { color: theme.text }]}>{streakInfo.monthly.longestStreak} months</Text>
              </View>
            </View>
          </View>
          {streakInfo.lastWorkoutDate && (
            <View style={[styles.lastWorkoutRow, { borderTopColor: theme.border }]}>
              <CalendarIcon size={16} color={theme.textSecondary} />
              <Text style={[styles.lastWorkoutText, { color: theme.textSecondary }]}>
                Last workout: {new Date(streakInfo.lastWorkoutDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Equipment */}
      <View style={[styles.infoSection, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Equipment</Text>
        <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Shirt</Text><Text style={[styles.infoValue, { color: theme.text }]}>{character.equippedShirt || 'None'}</Text></View>
        <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Pants</Text><Text style={[styles.infoValue, { color: theme.text }]}>{character.equippedPants || 'None'}</Text></View>
        <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Equipment</Text><Text style={[styles.infoValue, { color: theme.text }]}>{character.equippedEquipment || 'None'}</Text></View>
      </View>

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
  dayCountBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 9,
    fontWeight: '700',
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
  statsContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  streakGrid: {
    gap: 12,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  streakContent: {
    flex: 1,
  },
  streakLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  streakValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastWorkoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  lastWorkoutText: {
    fontSize: 12,
  },
}); 