import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChallengeService } from '@/services/challengeService';
import { ActiveChallenge } from '@/types';
import { useAuth } from './useAuth';

const fetchActiveChallenges = async (userId: string | number): Promise<ActiveChallenge[]> => {
  if (!userId) return [];
  try {
    const response = await ChallengeService.getActiveChallenges(userId);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching active challenges:', error);
    return [];
  }
};

export const useActiveChallenges = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['challenges', 'active', userId],
    queryFn: () => fetchActiveChallenges(userId!),
    enabled: !!userId, // Only run if userId is available
    refetchInterval: 2 * 60 * 1000, // Frequent updates for active progress
    staleTime: 30 * 1000,
    retry: 2,
  });
};

export const useUpdateChallengeProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ challengeId, progress }: { challengeId: string; progress: number }) => 
      ChallengeService.updateChallengeProgress(challengeId, progress),
    onSuccess: () => {
      // Invalidate active challenges to show new progress
      queryClient.invalidateQueries({ queryKey: ['challenges', 'active'] });
    },
  });
};
