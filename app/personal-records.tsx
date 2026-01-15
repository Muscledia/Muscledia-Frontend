import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { PersonalRecordsService } from '@/services/personalRecordsService';
import { PersonalRecord, PRStatistics } from '@/types/personalRecords';
import { PRList } from '@/components/pr/PRList';
import { PRStatisticsCard } from '@/components/pr/PRStatisticsCard';
import { useHaptics } from '@/hooks/useHaptics';

export default function PersonalRecordsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const { impact } = useHaptics();

  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PersonalRecord[]>([]);
  const [statistics, setStatistics] = useState<PRStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchData = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) setLoading(true);
      setError(null);
      
      const [recordsRes, statsRes] = await Promise.all([
        PersonalRecordsService.getPersonalRecords(forceRefresh),
        PersonalRecordsService.getPRStatistics(forceRefresh)
      ]);

      if (recordsRes.success && recordsRes.data) {
        setRecords(recordsRes.data);
        setFilteredRecords(recordsRes.data);
      } else {
        setError(recordsRes.message || 'Failed to load records');
      }

      if (statsRes.success && statsRes.data) {
        setStatistics(statsRes.data);
      }
    } catch (err) {
      console.error('Error fetching PR data:', err);
      setError('An error occurred while loading your records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecords(records);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = records.filter(record => 
      record.exerciseName.toLowerCase().includes(query) ||
      record.formattedDescription.toLowerCase().includes(query) ||
      record.recordType.toLowerCase().replace('_', ' ').includes(query)
    );
    setFilteredRecords(filtered);
  }, [searchQuery, records]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    impact('light');
    fetchData(true);
  }, []);

  const handleRecordPress = (record: PersonalRecord) => {
    console.log('Pressed record:', record.id);
  };

  const toggleSearch = () => {
    impact('light');
    if (isSearching) {
      setSearchQuery('');
      setIsSearching(false);
    } else {
      setIsSearching(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          
          {!isSearching ? (
            <Text style={[styles.headerTitle, { color: theme.text }]}>Personal Records</Text>
          ) : (
            <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
              <Search size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search exercises..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity onPress={toggleSearch} style={styles.searchButton}>
          {isSearching ? (
            <Text style={[styles.cancelText, { color: theme.accent }]}>Cancel</Text>
          ) : (
            <Search size={24} color={theme.text} />
          )}
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.accent }]}
            onPress={() => fetchData(true)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
          }
        >
          {!isSearching && statistics && <PRStatisticsCard statistics={statistics} />}
          
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {searchQuery ? `Results for "${searchQuery}"` : 'Your Records'}
          </Text>
          
          <PRList 
            records={filteredRecords}
            onRecordPress={handleRecordPress}
          />
        </ScrollView>
      )}
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
    padding: 16,
    paddingTop: 60,
    gap: 16,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  searchButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
