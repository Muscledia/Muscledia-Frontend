import React from 'react';
import { View, Text, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
  withTiming
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Challenge } from '@/types';
import { Colors, getThemeColors } from '@/constants/Colors';
import { Dumbbell, Heart, Brain, Zap, Activity, Clock, Coins, Trophy, ChevronsUp, ChevronsDown, Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_HEIGHT = 380;

interface ChallengeCardProps {
  challenge: Challenge;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
}

const getIconForType = (type: string, color: string) => {
  // Map backend types if known, otherwise default or generic
  const normalizedType = type?.toUpperCase();
  if (normalizedType?.includes('STRENGTH')) return <Dumbbell size={24} color={color} />;
  if (normalizedType?.includes('CARDIO')) return <Heart size={24} color={color} />;
  if (normalizedType?.includes('SKILL')) return <Zap size={24} color={color} />;
  if (normalizedType?.includes('FLEXIBILITY')) return <Activity size={24} color={color} />;
  if (normalizedType?.includes('MINDFULNESS')) return <Brain size={24} color={color} />;
  if (normalizedType === 'DAILY') return <Calendar size={24} color={color} />;
  
  return <Trophy size={24} color={color} />;
};

const mapDifficulty = (difficulty: string) => {
  const d = difficulty?.toUpperCase();
  if (d === 'BEGINNER') return 'Easy';
  if (d === 'INTERMEDIATE') return 'Medium';
  if (d === 'ADVANCED') return 'Hard';
  return difficulty || 'Medium';
};

const DifficultyIndicator = ({ difficulty }: { difficulty: string }) => {
  const displayDifficulty = mapDifficulty(difficulty);
  const dots = displayDifficulty === 'Easy' ? 1 : displayDifficulty === 'Medium' ? 2 : 3;
  const color = displayDifficulty === 'Easy' ? '#4CAF50' : displayDifficulty === 'Medium' ? '#FFD700' : '#F44336';
  
  return (
    <View style={styles.difficultyContainer}>
      {[...Array(3)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.difficultyDot,
            { backgroundColor: i < dots ? color : '#333' }
          ]}
        />
      ))}
      <Text style={[styles.difficultyText, { color }]}>{displayDifficulty}</Text>
    </View>
  );
};

export const ChallengeCard = ({ challenge, onAccept, onDismiss }: ChallengeCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  
  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = startY.value + event.translationY;
    })
    .onEnd((event) => {
      if (event.translationY < -100) {
        // Swipe Up (Accept)
        runOnJS(onAccept)(challenge.id);
        translateY.value = withTiming(-500);
      } else if (event.translationY > 100) {
        // Swipe Down (Dismiss)
        runOnJS(onDismiss)(challenge.id);
        translateY.value = withTiming(500);
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-200, 0, 200],
      [0.8, 1, 0.8],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      translateY.value,
      [-200, 0, 200],
      [0.9, 1, 0.9],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY: translateY.value }, { scale }],
      opacity,
    };
  });

  // Action Indicators
  const acceptOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [-150, -50], [1, 0], Extrapolation.CLAMP),
  }));

  const dismissOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [50, 150], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.cardContainer, animatedStyle]}>
          <LinearGradient
            colors={isDark ? ['#2A2A2A', '#1C1C1C'] : ['#FFFFFF', '#F0F0F0']}
            style={[styles.card, { borderColor: theme.border }]}
          >
            {/* Action Overlays */}
            <Animated.View style={[styles.overlay, styles.acceptOverlay, acceptOpacity]}>
              <View style={styles.actionContent}>
                <ChevronsUp size={40} color="#4CAF50" />
                <Text style={styles.acceptText}>ACCEPT</Text>
              </View>
            </Animated.View>
            
            <Animated.View style={[styles.overlay, styles.dismissOverlay, dismissOpacity]}>
               <View style={styles.actionContent}>
                <ChevronsDown size={40} color="#F44336" />
                <Text style={styles.dismissText}>DISMISS</Text>
              </View>
            </Animated.View>

            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: theme.surfaceLight }]}>
                {getIconForType(challenge.type, theme.accent)}
              </View>
              <DifficultyIndicator difficulty={challenge.difficulty} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                {challenge.name}
              </Text>
              <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={3}>
                {challenge.description}
              </Text>
            </View>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.border }]}>
              <View style={styles.rewardContainer}>
                <View style={styles.rewardItem}>
                  <Trophy size={16} color={theme.xp} />
                  <Text style={[styles.rewardText, { color: theme.xp }]}>{challenge.rewardPoints} XP</Text>
                </View>
                {/* 
                <View style={styles.rewardItem}>
                  <Coins size={16} color={theme.accent} />
                  <Text style={[styles.rewardText, { color: theme.accent }]}>{0}</Text>
                </View>
                */}
              </View>
              <View style={styles.timeContainer}>
                <Clock size={16} color={theme.textSecondary} />
                <Text style={[styles.timeText, { color: theme.textSecondary }]}>{challenge.estimatedDuration || 'N/A'}</Text>
              </View>
            </View>
            
             <View style={styles.swipeHint}>
                <Text style={[styles.swipeText, { color: theme.textMuted }]}>Swipe up to accept</Text>
             </View>

          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    height: '100%',
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyContainer: {
    alignItems: 'flex-end',
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 28,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  rewardContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  acceptOverlay: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    bottom: '50%', 
    top: 0, 
    height: '100%',
  },
  dismissOverlay: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    top: 0,
    height: '100%',
  },
  actionContent: {
    alignItems: 'center',
    transform: [{ scale: 1.2 }],
  },
  acceptText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 24,
    marginTop: 8,
    letterSpacing: 2,
  },
  dismissText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 24,
    marginTop: 8,
    letterSpacing: 2,
  },
  swipeHint: {
      position: 'absolute',
      bottom: 60,
      width: '100%',
      alignItems: 'center',
      opacity: 0.6,
  },
  swipeText: {
      fontSize: 10,
      textTransform: 'uppercase',
  }
});
