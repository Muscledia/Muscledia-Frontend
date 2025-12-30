import { useQuery } from '@tanstack/react-query';
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
