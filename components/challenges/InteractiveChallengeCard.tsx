import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Pressable, useColorScheme } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSpring,
  interpolate,
  Extrapolation,
  useDerivedValue,
  runOnJS
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Colors, getThemeColors } from '@/constants/Colors';
import { Challenge } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Trophy, ChevronDown, ChevronUp, CheckCircle, Lock } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CIRCLE_RADIUS = 30;
const STROKE_WIDTH = 6;
const CIRCLE_LENGTH = 2 * Math.PI * CIRCLE_RADIUS;

export type ChallengeCardState = 'available' | 'active' | 'completed' | 'locked';

export interface ChallengeCardProps {
  challenge: Challenge;
  state: ChallengeCardState;
  onAccept: () => void;
  onViewDetails: () => void;
  onAbandon?: () => void; // Added onAbandon prop
  currentProgress?: number;
  progressRealtime?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const InteractiveChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  state,
  onAccept,
  onViewDetails,
  onAbandon,
  currentProgress = 0,
  progressRealtime = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  
  const [expanded, setExpanded] = useState(false);
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const expandHeight = useSharedValue(0);

  // Initialize progress - use currentProgress prop if provided, otherwise use challenge.currentProgress
  useEffect(() => {
    const progressValue = currentProgress !== undefined ? currentProgress : challenge.currentProgress;
    const targetProgress = Math.min(Math.max(progressValue / challenge.targetValue, 0), 1);
    progress.value = withTiming(targetProgress, { duration: 800 });
  }, [currentProgress, challenge.currentProgress, challenge.targetValue]);

  // Handle expand animation
  useEffect(() => {
    expandHeight.value = withSpring(expanded ? 1 : 0, {
      damping: 15,
      stiffness: 100
    });
  }, [expanded]);

  const animatedProps = useDerivedValue(() => {
    return {
      strokeDashoffset: CIRCLE_LENGTH * (1 - progress.value),
    };
  });

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const detailsStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(expandHeight.value, [0, 1], [0, 120], Extrapolation.CLAMP),
      opacity: expandHeight.value,
      overflow: 'hidden',
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleToggleExpand = () => {
    Haptics.selectionAsync();
    setExpanded(!expanded);
  };

  const handleAction = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (state === 'available') {
      onAccept();
    } else {
      onViewDetails();
    }
  };

  // Determine colors based on state and theme
  const getStatusColors = () => {
    if (state === 'active') {
      // Golden theme for active
      return { 
        start: Colors.gradients.gold[0], 
        end: Colors.gradients.gold[1], 
        text: Colors.dark.cardText, // Dark text on gold
        icon: Colors.dark.cardText,
        ring: Colors.dark.cardText,
        ringBg: 'rgba(0,0,0,0.1)',
        badge: 'rgba(0,0,0,0.1)',
        buttonBg: Colors.dark.background,
        buttonText: Colors.gradients.gold[0]
      };
    } else if (state === 'completed') {
      // Green theme for completed
      return { 
        start: Colors.status.success.dark, 
        end: Colors.status.success.main, 
        text: '#FFFFFF',
        icon: '#FFFFFF',
        ring: '#FFFFFF',
        ringBg: 'rgba(255,255,255,0.2)',
        badge: 'rgba(255,255,255,0.2)',
        buttonBg: '#FFFFFF',
        buttonText: Colors.status.success.dark
      };
    } else if (state === 'locked') {
      // Dark/Grey for locked
      return { 
        start: isDark ? '#1a1a1a' : '#E2E8F0', 
        end: isDark ? '#111111' : '#CBD5E1', 
        text: isDark ? Colors.dark.textMuted : Colors.light.textMuted,
        icon: isDark ? Colors.dark.textMuted : Colors.light.textMuted,
        ring: isDark ? Colors.dark.textMuted : Colors.light.textMuted,
        ringBg: 'rgba(255,255,255,0.05)',
        badge: 'rgba(255,255,255,0.1)',
        buttonBg: 'transparent',
        buttonText: 'transparent'
      };
    } else {
      // Available (Standard Theme Surface)
      return { 
        start: isDark ? '#2A2A2A' : '#F8FAFC', 
        end: isDark ? '#1C1C1C' : '#F1F5F9', 
        text: theme.text,
        icon: theme.text,
        ring: theme.accent,
        ringBg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        badge: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        buttonBg: theme.accent,
        buttonText: isDark ? Colors.dark.cardText : Colors.light.cardText
      };
    }
  };

  const colors = getStatusColors();
  // Use currentProgress prop if provided, otherwise use challenge.currentProgress or completionPercentage
  const progressValue = currentProgress !== undefined ? currentProgress : (challenge.currentProgress || 0);
  const percentage = state === 'available' ? 0 : Math.round((progressValue / challenge.targetValue) * 100);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handleToggleExpand}
      accessible={true}
      accessibilityLabel={`${challenge.name}, ${state} challenge`}
      accessibilityHint="Double tap to expand details"
    >
      <Animated.View style={[styles.container, cardStyle]}>
        <LinearGradient
          colors={[colors.start, colors.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: colors.text }]}>{challenge.name}</Text>
                {state === 'active' && (
                  <View style={[styles.activeBadge, { backgroundColor: colors.badge }]}>
                    <Text style={[styles.activeText, { color: colors.text }]}>ACTIVE</Text>
                  </View>
                )}
                {state === 'locked' && <Lock size={16} color={colors.icon} />}
              </View>
              <Text style={[styles.description, { color: colors.text, opacity: 0.8 }]}>
                {challenge.description}
              </Text>
            </View>
            
            {/* Progress Ring */}
            <View style={styles.progressContainer}>
              <Svg width={CIRCLE_RADIUS * 2 + STROKE_WIDTH} height={CIRCLE_RADIUS * 2 + STROKE_WIDTH}>
                <G rotation="-90" origin={`${CIRCLE_RADIUS + STROKE_WIDTH/2}, ${CIRCLE_RADIUS + STROKE_WIDTH/2}`}>
                  <Circle
                    cx={CIRCLE_RADIUS + STROKE_WIDTH/2}
                    cy={CIRCLE_RADIUS + STROKE_WIDTH/2}
                    r={CIRCLE_RADIUS}
                    stroke={colors.ringBg}
                    strokeWidth={STROKE_WIDTH}
                  />
                  {state !== 'locked' && (
                    <AnimatedCircle
                      cx={CIRCLE_RADIUS + STROKE_WIDTH/2}
                      cy={CIRCLE_RADIUS + STROKE_WIDTH/2}
                      r={CIRCLE_RADIUS}
                      stroke={colors.ring}
                      strokeWidth={STROKE_WIDTH}
                      strokeDasharray={CIRCLE_LENGTH}
                      animatedProps={animatedProps}
                      strokeLinecap="round"
                    />
                  )}
                </G>
              </Svg>
              <View style={styles.progressTextContainer}>
                {state === 'completed' ? (
                  <CheckCircle size={20} color={colors.icon} />
                ) : (
                  <Text style={[styles.progressPercentage, { color: colors.text }]}>
                    {state === 'available' ? '0%' : `${percentage}%`}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Expanded Details */}
          <Animated.View style={[styles.details, detailsStyle]}>
            <Text style={[styles.motivationalText, { color: colors.text }]}>
              {state === 'active' 
                ? "You're crushing it! Keep going!" 
                : state === 'completed' 
                  ? "Challenge Complete! Outstanding work!"
                  : "Ready to start this challenge?"}
            </Text>
            <View style={styles.statsRow}>
              <View style={[styles.stat, { backgroundColor: colors.badge }]}>
                <Trophy size={16} color={colors.icon} />
                <Text style={[styles.statText, { color: colors.text }]}>{challenge.rewardPoints} pts</Text>
              </View>
              <View style={[styles.stat, { backgroundColor: colors.badge }]}>
                <Clock size={16} color={colors.icon} />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {challenge.timeRemaining || '7 days'}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Action Button */}
          {state !== 'locked' && (
            <View style={styles.actionButtonsContainer}>
              <Pressable 
                style={[styles.actionButton, { backgroundColor: colors.buttonBg, flex: 1 }]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleAction();
                }}
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
              >
                <Text style={[styles.actionButtonText, { color: colors.buttonText }]}>
                  {state === 'available' ? 'START CHALLENGE' : 
                   state === 'active' ? 'TRACK PROGRESS' : 'VIEW DETAILS'}
                </Text>
              </Pressable>

              {state === 'active' && onAbandon && (
                 <Pressable 
                   style={[styles.actionButton, styles.abandonButton]}
                   onPress={(e) => {
                     e.stopPropagation();
                     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                     onAbandon();
                   }}
                   android_ripple={{ color: 'rgba(255,0,0,0.1)', borderless: false }}
                 >
                   <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
                     ABANDON
                   </Text>
                 </Pressable>
              )}
            </View>
          )}

          {/* Expand Indicator */}
          <View style={styles.expandIndicator}>
            {expanded ? (
              <ChevronUp size={20} color={colors.text} style={{ opacity: 0.5 }} />
            ) : (
              <ChevronDown size={20} color={colors.text} style={{ opacity: 0.5 }} />
            )}
          </View>

        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginVertical: 8,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    padding: 20,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginRight: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  details: {
    marginTop: 16,
  },
  motivationalText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abandonButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 16,
    flex: 0.4,
  },
  actionButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  expandIndicator: {
    alignItems: 'center',
    marginTop: 8,
  },
});
