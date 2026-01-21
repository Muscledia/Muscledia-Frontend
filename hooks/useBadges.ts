import { useQuery } from '@tanstack/react-query';
import { BadgeService } from '@/services/badgeService';
import { Badge, BadgeStatus } from '@/types';

/**
 * Hook to fetch badge status (catalog + user badges + progress)
 * This is the main hook used in the achievements screen
 */
export function useBadgeStatus() {
  return useQuery({
    queryKey: ['badges', 'status'],
    queryFn: () => BadgeService.getBadgeStatus(),
    staleTime: 30 * 1000, // 30 seconds - data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch the complete badge catalog
 * Used when you only need the catalog without user-specific data
 */
export function useBadgeCatalog() {
  return useQuery({
    queryKey: ['badges', 'catalog'],
    queryFn: () => BadgeService.getAllBadges(),
    staleTime: 15 * 60 * 1000, // 15 minutes - catalog changes rarely
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch user's earned badges
 * Used when you only need the user's badges without the full catalog
 */
export function useUserBadges() {
  return useQuery({
    queryKey: ['badges', 'user'],
    queryFn: () => BadgeService.getUserBadges(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
    retry: 2,
  });
}
