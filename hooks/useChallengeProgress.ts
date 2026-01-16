import { useEffect, useRef, useState, useCallback } from 'react';
import { useActiveChallenges } from './useActiveChallenges';
import { UserChallenge } from '@/types';

export interface ChallengeCompletionEvent {
  challengeId: string;
  challengeName: string;
  pointsEarned: number;
}

export const useChallengeProgress = () => {
  const { data: challenges = [], isLoading } = useActiveChallenges();
  const [completionEvent, setCompletionEvent] = useState<ChallengeCompletionEvent | null>(null);
  const previousProgressRef = useRef<Map<string, number>>(new Map());
  const previousStatusRef = useRef<Map<string, string>>(new Map());
  const completedChallengesRef = useRef<Set<string>>(new Set());

  // Initialize previous progress and status on first load
  useEffect(() => {
    if (challenges.length > 0 && previousProgressRef.current.size === 0) {
      challenges.forEach((challenge) => {
        previousProgressRef.current.set(challenge.challengeId, challenge.currentProgress);
        previousStatusRef.current.set(challenge.challengeId, challenge.status);
        // Mark already completed challenges to avoid showing modal for them
        if (challenge.status === 'COMPLETED') {
          completedChallengesRef.current.add(challenge.challengeId);
        }
      });
    }
  }, [challenges.length === 0 ? null : challenges]);

  // Detect completions by comparing current progress with previous
  useEffect(() => {
    // Only check for completions if no completion event is currently showing
    if (completionEvent) {
      return;
    }

    challenges.forEach((challenge) => {
      const previousProgress = previousProgressRef.current.get(challenge.challengeId) ?? 0;
      const previousStatus = previousStatusRef.current.get(challenge.challengeId) ?? 'ACTIVE';
      const currentProgress = challenge.currentProgress;
      const targetValue = challenge.targetValue;

      // Check if challenge was just completed (status changed from ACTIVE to COMPLETED)
      if (
        challenge.status === 'COMPLETED' &&
        previousStatus !== 'COMPLETED' &&
        previousProgress < targetValue &&
        currentProgress >= targetValue &&
        !completedChallengesRef.current.has(challenge.challengeId)
      ) {
        // Mark as completed to prevent duplicate celebrations
        completedChallengesRef.current.add(challenge.challengeId);
        
        setCompletionEvent({
          challengeId: challenge.challengeId,
          challengeName: challenge.challengeName,
          pointsEarned: challenge.pointsEarned || 0,
        });
      }

      // Update previous progress and status
      previousProgressRef.current.set(challenge.challengeId, currentProgress);
      previousStatusRef.current.set(challenge.challengeId, challenge.status);
    });
  }, [challenges, completionEvent]);

  const dismissCompletion = useCallback(() => {
    setCompletionEvent(null);
  }, []);

  return {
    challenges,
    isLoading,
    completionEvent,
    dismissCompletion,
  };
};
