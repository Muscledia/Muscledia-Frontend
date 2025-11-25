import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path, Circle, Line, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  useDerivedValue,
  withTiming
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors, getThemeColors } from '@/constants/Colors';
import { JourneyNode, JourneyMapProps } from '@/types/journey';
import { Lock, Check, Star, Zap } from 'lucide-react-native';
import { useColorScheme } from 'react-native';

const { width, height } = Dimensions.get('window');
const NODE_RADIUS = 24;
const PATH_STROKE_WIDTH = 4;

export const JourneyMap: React.FC<JourneyMapProps> = ({ nodes, onNodePress, activeJourneyType }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  
  // Interaction state
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Gestures
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ]
    };
  });

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'completed': return Colors.status.success.main;
      case 'active': return theme.accent;
      case 'available': return theme.accentSecondary; // Or a different color for available but not started
      case 'locked': return isDark ? '#4B5563' : '#9CA3AF';
      default: return theme.textMuted;
    }
  };

  const getNodeIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check size={16} color="#FFF" />;
      case 'active': return <Zap size={16} color={Colors.dark.background} />;
      case 'locked': return <Lock size={16} color="rgba(255,255,255,0.5)" />;
      default: return <Star size={16} color="#FFF" />;
    }
  };

  // Generate SVG Path
  const generatePath = () => {
    if (nodes.length < 2) return '';
    
    // Sort nodes by phase or some logical order if needed, assuming array order for now
    // A more complex implementation would perform a topological sort based on prerequisites
    
    let path = `M ${nodes[0].position.x} ${nodes[0].position.y}`;
    
    for (let i = 1; i < nodes.length; i++) {
        const prev = nodes[i-1];
        const curr = nodes[i];
        
        // Simple curve logic - can be enhanced for better aesthetics
        const midX = (prev.position.x + curr.position.x) / 2;
        const midY = (prev.position.y + curr.position.y) / 2;
        
        // Quadratic bezier for smoother paths
        // Control point logic can be adjusted to create winding paths
        const controlX = midX + (i % 2 === 0 ? 50 : -50); 
        const controlY = midY; 

        path += ` Q ${controlX} ${controlY}, ${curr.position.x} ${curr.position.y}`;
    }
    return path;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.mapContainer, animatedStyle]}>
          <Svg width={width * 2} height={height * 2} style={styles.svg}>
            <Defs>
              <LinearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={theme.accent} stopOpacity="0.8" />
                <Stop offset="1" stopColor={Colors.status.success.main} stopOpacity="0.8" />
              </LinearGradient>
            </Defs>
            
            {/* Draw Path */}
            <Path
              d={generatePath()}
              stroke="url(#pathGradient)"
              strokeWidth={PATH_STROKE_WIDTH}
              fill="none"
              strokeDasharray="10, 5" // Dashed line style
            />

            {/* Draw Nodes */}
            {nodes.map((node) => (
              <G key={node.id} onPress={() => onNodePress(node)}>
                {/* Node Circle */}
                <Circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={NODE_RADIUS}
                  fill={getNodeColor(node.status)}
                  stroke={theme.background}
                  strokeWidth={2}
                />
                
                {/* Status Indicator Ring for Active */}
                {node.status === 'active' && (
                   <Circle
                    cx={node.position.x}
                    cy={node.position.y}
                    r={NODE_RADIUS + 4}
                    stroke={theme.accent}
                    strokeWidth={2}
                    strokeDasharray="4, 4"
                    fill="none"
                    opacity={0.8}
                   />
                )}

                {/* Node Label (Optional, maybe show on zoom or tap) */}
                {scale.value > 0.8 && (
                    // SVG Text doesn't support auto-wrap well, simplified logic here
                    // In a real app, use React Native Text overlaid absolutely or enhance SVG text
                    <></> 
                )}
              </G>
            ))}
          </Svg>

          {/* Render RN Views for Icons/Interactivity over SVG nodes for better touch handling */}
          {nodes.map((node) => (
             <TouchableOpacity
                key={`touch-${node.id}`}
                style={[
                    styles.nodeTouchArea,
                    { 
                        left: node.position.x - NODE_RADIUS, 
                        top: node.position.y - NODE_RADIUS,
                        width: NODE_RADIUS * 2,
                        height: NODE_RADIUS * 2,
                        borderRadius: NODE_RADIUS,
                    }
                ]}
                onPress={() => onNodePress(node)}
                activeOpacity={0.8}
             >
                <View style={styles.iconContainer}>
                    {getNodeIcon(node.status)}
                </View>
                {/* Floating Title Label */}
                <View style={styles.labelContainer}>
                     <Text style={[styles.nodeLabel, { color: theme.textSecondary, backgroundColor: theme.surface }]}>
                        {node.title}
                     </Text>
                </View>
             </TouchableOpacity>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  mapContainer: {
    flex: 1,
  },
  svg: {
    position: 'absolute',
  },
  nodeTouchArea: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  labelContainer: {
    position: 'absolute',
    top: 50,
    alignItems: 'center',
    width: 120,
  },
  nodeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    textAlign: 'center',
    overflow: 'hidden',
    elevation: 2,
  }
});

