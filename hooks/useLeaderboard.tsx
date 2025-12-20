import { useState, useEffect, useCallback } from 'react';
import { LeaderboardService } from '@/services';
import { LeaderboardResponse, LeaderboardType } from '@/types';
import { useAuth } from './useAuth';

interface UseLeaderboardReturn {
  data: LeaderboardResponse | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  currentUserRank: number | null;
  currentUserEntry: LeaderboardResponse['data']['currentUser'] | null;
}

export function useLeaderboard(type: LeaderboardType): UseLeaderboardReturn {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchLeaderboard = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Clear cache on refresh to force fresh data
      const useCache = !isRefreshing;
      const response = await LeaderboardService.getLeaderboard(type, useCache);
      
      setData(response);
    } catch (err: any) {
      console.error('[useLeaderboard] Error fetching leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [type]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const refresh = useCallback(async () => {
    // Clear cache before refreshing
    await LeaderboardService.clearCache(type);
    await fetchLeaderboard(true);
  }, [type, fetchLeaderboard]);

  const currentUserRank = data?.data?.currentUser?.rank ?? null;
  const currentUserEntry = data?.data?.currentUser ?? null;

  return {
    data,
    loading,
    error,
    refreshing,
    refresh,
    currentUserRank,
    currentUserEntry,
  };
}
