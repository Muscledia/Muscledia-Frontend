import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withSequence, 
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, Share2, ArrowRight } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface CelebrationData {
  challengeName: string;
  pointsEarned: number;
}

interface CelebrationScreenProps {
  visible: boolean;
  data: CelebrationData;
  onClose: () => void;
}

// Simple confetti particle component
const Particle = ({ delay, x, color }: { delay: number; x: number; color: string }) => {
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(height + 50, { duration: 2500, easing: Easing.out(Easing.quad) }));
    opacity.value = withDelay(delay + 1500, withTiming(0, { duration: 1000 }));
    rotate.value = withDelay(delay, withTiming(360 * 3, { duration: 2500 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
    left: x,
    position: 'absolute',
    top: 0,
  }));

  return (
    <Animated.View style={[style, { width: 10, height: 10, backgroundColor: color, borderRadius: 2 }]} />
  );
};

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({ visible, data, onClose }) => {
  const colorScheme = useColorScheme();
  const theme = getThemeColors(colorScheme === 'dark');
  
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const pointsScale = useSharedValue(1);
  
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withTiming(1, { duration: 500 });
      setShowConfetti(true);
      
      // Haptic Feedback sequence
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.selectionAsync(), 200);
      setTimeout(() => Haptics.selectionAsync(), 400);

      // Pulse points
      pointsScale.value = withSequence(
        withDelay(600, withSpring(1.2)),
        withSpring(1)
      );
    } else {
      scale.value = 0;
      opacity.value = 0;
      setShowConfetti(false);
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const pointsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pointsScale.value }],
  }));

  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * width,
    delay: Math.random() * 500,
    color: [theme.accent, Colors.status.success.main, '#FFD700', '#FF6B35'][Math.floor(Math.random() * 4)],
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        {showConfetti && particles.map(p => (
           <Particle key={p.id} x={p.x} delay={p.delay} color={p.color} />
        ))}

        <Animated.View style={[styles.card, { backgroundColor: theme.surface }, containerStyle]}>
          <LinearGradient
            colors={[theme.accent + '20', 'transparent']}
            style={styles.gradientBg}
          />
          
          <View style={styles.iconContainer}>
            <Trophy size={64} color="#FFD700" />
            <Star size={32} color={theme.accent} style={styles.starIcon} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>CHALLENGE COMPLETE!</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{data.challengeName}</Text>

          <Animated.View style={[styles.pointsContainer, pointsStyle]}>
            <Text style={[styles.pointsLabel, { color: theme.textSecondary }]}>Points Earned</Text>
            <Text style={[styles.pointsValue, { color: theme.accent }]}>+{data.pointsEarned}</Text>
          </Animated.View>

          <View style={styles.actions}>
            <TouchableOpacity 
                style={[styles.button, styles.secondaryButton, { borderColor: theme.border }]}
                onPress={() => {}}
            >
              <Share2 size={20} color={theme.text} />
              <Text style={[styles.buttonText, { color: theme.text }]}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.button, { backgroundColor: theme.accent }]}
                onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: Colors.dark.background }]}>Continue</Text>
              <ArrowRight size={20} color={Colors.dark.background} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width * 0.85,
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    transform: [{ rotate: '15deg' }],
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  pointsLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontWeight: '600',
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});





