import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, useAnimatedStyle, withSpring, useSharedValue, withSequence } from 'react-native-reanimated';
import { useRealtimeProgress } from '@/hooks/useRealtimeProgress';
import { InteractiveChallengeCard, ChallengeCardState } from '@/components/challenges/InteractiveChallengeCard';
import { Challenge } from '@/types';
import { Colors, getThemeColors } from '@/constants/Colors';
import { Plus, BarChart2 } from 'lucide-react-native';
import { useColorScheme } from 'react-native';

interface ActiveChallengeCardProps {
  challenge: Challenge;
  initialProgress: number;
  onUpdate: (id: string, newProgress: number) => void;
  onAbandon: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export const ActiveChallengeCard: React.FC<ActiveChallengeCardProps> = ({
  challenge,
  initialProgress,
  onUpdate,
  onAbandon,
  onViewDetails
}) => {
  const { progress, message, updateProgress } = useRealtimeProgress(challenge.id, initialProgress);
  const colorScheme = useColorScheme();
  const theme = getThemeColors(colorScheme === 'dark');

  // Sync internal hook state with parent state whenever progress changes
  useEffect(() => {
    if (progress !== initialProgress) {
        // Prevent infinite loop by checking if progress actually changed significantly
        // or ensure onUpdate is stable
        onUpdate(challenge.id, progress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, challenge.id]);

  const handleManualUpdate = () => {
    // Simulate adding 5 reps/units
    updateProgress(5, challenge.targetValue);
  };

  return (
    <View>
      <InteractiveChallengeCard
        challenge={challenge}
        state="active"
        currentProgress={progress}
        onAccept={() => {}} // Already accepted
        onViewDetails={() => onViewDetails(challenge.id)}
        onAbandon={() => onAbandon(challenge.id)}
        progressRealtime={true}
      />
      
      {/* Real-time Motivation Overlay */}
      {message && (
        <Animated.View 
            entering={ZoomIn} 
            exiting={FadeOut} 
            style={styles.messageOverlay}
        >
            <Text style={styles.messageText}>{message}</Text>
        </Animated.View>
      )}

      {/* Manual Controls & Stats */}
      <View style={[styles.controlsContainer, { backgroundColor: theme.surface }]}>
        <View style={styles.statsRow}>
             <BarChart2 size={16} color={theme.textSecondary} />
             <Text style={[styles.statsText, { color: theme.textSecondary }]}>
                {Math.round((progress / challenge.targetValue) * 100)}% Complete
             </Text>
        </View>
        
        <TouchableOpacity 
            style={[styles.updateButton, { backgroundColor: theme.accent }]}
            onPress={handleManualUpdate}
        >
            <Plus size={16} color={Colors.dark.background} />
            <Text style={[styles.updateButtonText, { color: Colors.dark.background }]}>
                +5 {challenge.progressUnit || 'Reps'}
            </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    marginTop: -16, // Overlap slightly or connect visually
    marginHorizontal: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 12,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: -1, // Behind the card
  },
  statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  statsText: {
      fontSize: 12,
      fontWeight: '600',
  },
  updateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 4,
  },
  updateButtonText: {
      fontSize: 12,
      fontWeight: 'bold',
  },
  messageOverlay: {
      position: 'absolute',
      top: 20,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
  },
  messageText: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: '#FFD700',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      fontWeight: 'bold',
      fontSize: 14,
      overflow: 'hidden',
  }
});

