import React from 'react';
import { CelebrationScreen } from './CelebrationScreen';

interface ChallengeCompletionModalProps {
  visible: boolean;
  challengeName: string;
  pointsEarned: number;
  onClose: () => void;
}

/**
 * ChallengeCompletionModal
 * Wrapper around CelebrationScreen specifically for challenge completions
 * Prevents duplicate celebrations by managing visibility state
 */
export const ChallengeCompletionModal: React.FC<ChallengeCompletionModalProps> = ({
  visible,
  challengeName,
  pointsEarned,
  onClose,
}) => {
  return (
    <CelebrationScreen
      visible={visible}
      data={{
        challengeName,
        pointsEarned,
      }}
      onClose={onClose}
    />
  );
};
