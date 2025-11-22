import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChallengeService } from '@/services/challengeService';
import { Challenge } from '@/types/api';

const fetchDailyChallenges = async (): Promise<Challenge[]> => {
  try {
    const response = await ChallengeService.getDailyChallenges();
    if (response.success && response.data) {
      return response.data;
    }
    // Return empty array if success is false but no error thrown
    return [];
  } catch (error) {
    console.error('Error fetching daily challenges:', error);
    return [];
  }
};

export const useDailyChallenges = () => {
  return useQuery({
    queryKey: ['challenges', 'daily'],
    queryFn: fetchDailyChallenges,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
    retry: 2,
  });
};

export const useAcceptChallenge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (challengeId: string) => ChallengeService.startChallenge(challengeId),
    onSuccess: () => {
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['activeChallenges'] });
    },
  });
};
