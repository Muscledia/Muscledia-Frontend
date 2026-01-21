import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LeaderboardService } from '@/services';
import { LeaderboardResponse, LeaderboardType } from '@/types';

interface UseLeaderboardReturn {
  data: LeaderboardResponse | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  currentUserRank: number | null;
  currentUserEntry: LeaderboardResponse['data']['currentUser'] | null;
}

const fetchLeaderboard = async (type: LeaderboardType): Promise<LeaderboardResponse> => {
  const response = await LeaderboardService.getLeaderboard(type);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch leaderboard');
  }
  
  return response;
};

export function useLeaderboard(type: LeaderboardType): UseLeaderboardReturn {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['leaderboard', type],
    queryFn: () => fetchLeaderboard(type),
    staleTime: 30 * 1000, // 30 seconds - data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
    retry: 2,
  });

  const refresh = async () => {
    // Invalidate and refetch
    await queryClient.invalidateQueries({ queryKey: ['leaderboard', type] });
    await refetch();
  };

  const currentUserRank = data?.data?.currentUser?.rank ?? null;
  const currentUserEntry = data?.data?.currentUser ?? null;

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error as Error).message || 'Failed to load leaderboard' : null,
    refreshing: isRefetching,
    refresh,
    currentUserRank,
    currentUserEntry,
  };
}
