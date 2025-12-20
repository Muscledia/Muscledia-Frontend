import { useQuery } from '@tanstack/react-query';
import { ChallengeService } from '@/services/challengeService';
import { Challenge } from '@/types';

const fetchWeeklyChallenges = async (): Promise<Challenge[]> => {
  try {
    const response = await ChallengeService.getWeeklyChallenges();
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching weekly challenges:', error);
    return [];
  }
};

export const useWeeklyChallenges = () => {
  return useQuery({
    queryKey: ['challenges', 'weekly'],
    queryFn: fetchWeeklyChallenges,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
    retry: 2,
  });
};

