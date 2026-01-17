import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

interface ProgressUpdate {
  challengeId: string;
  currentProgress: number;
  milestone?: string;
  motivationalMessage?: string;
}

export const useRealtimeProgress = (challengeId: string, initialProgress: number = 0) => {
  const [progress, setProgress] = useState(initialProgress);
  const [message, setMessage] = useState<string | null>(null);

  // Simulate WebSocket connection
  useEffect(() => {
    // In a real app, this would connect to a WebSocket
    // const ws = new WebSocket(`${WS_URL}/challenges/${challengeId}/progress`);
    
    // Simulating random updates for demo purposes
    // Only if progress is non-zero (active)
    let interval: NodeJS.Timeout | undefined;
    
    if (initialProgress > 0 && initialProgress < 100) { // Assuming 100 is target for % or just checking if active
        // This logic would be handled by the server pushing updates
    }

    return () => {
      if (interval) clearInterval(interval);
      // ws.close();
    };
  }, [challengeId, initialProgress]);

  const updateProgress = (increment: number, target: number) => {
    setProgress(prev => {
      const newProgress = Math.min(prev + increment, target);
      
      // Check for milestones
      const percentage = (newProgress / target) * 100;
      const prevPercentage = (prev / target) * 100;

      if (percentage >= 25 && prevPercentage < 25) {
        setMessage("25% Done! Good start!");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (percentage >= 50 && prevPercentage < 50) {
        setMessage("Halfway there! Keep pushing!");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (percentage >= 75 && prevPercentage < 75) {
        setMessage("Almost done! Finish strong!");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (percentage >= 100 && prevPercentage < 100) {
        setMessage("CHALLENGE COMPLETE! 🎉");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Clear message after 3 seconds
      if (percentage !== prevPercentage) {
          setTimeout(() => setMessage(null), 3000);
      }
      
      return newProgress;
    });
  };

  return { progress, message, updateProgress };
};

