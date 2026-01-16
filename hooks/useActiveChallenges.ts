import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import challengeService from '@/services/challengeService';
import { UserChallenge } from '@/types';

const fetchActiveChallenges = async (): Promise<UserChallenge[]> => {
  try {
    const response = await challengeService.getActiveChallenges();
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
  return useQuery({
    queryKey: ['challenges', 'active'],
    queryFn: fetchActiveChallenges,
    refetchInterval: 2 * 60 * 1000, // Frequent updates for active progress
    staleTime: 30 * 1000,
    retry: 2,
  });
};

export const useUpdateChallengeProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ challengeId, progress }: { challengeId: string; progress: number }) => {
      // Note: If there's a specific endpoint for updating progress, add it to challengeService
      // For now, this will just invalidate queries to refresh data
      // Progress might be tracked automatically by the backend when workouts are logged
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      // Invalidate queries to refresh challenge data
      queryClient.invalidateQueries({ queryKey: ['challenges', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
};
