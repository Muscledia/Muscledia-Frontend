import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type CharacterAvatarProps = {
  level: number;
  gender: string; // kept for backward compatibility, not used
  streak: number; // kept for potential styling, not used currently
  size?: 'small' | 'medium' | 'large';
  initials?: string; // when provided, used to render the avatar letters
};

export default function CharacterAvatar({ level, gender, streak, size = 'medium', initials }: CharacterAvatarProps) {
  // Determine size dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 50, height: 50, borderRadius: 25 };
      case 'large':
        return { width: 120, height: 120, borderRadius: 60 };
      case 'medium':
      default:
        return { width: 80, height: 80, borderRadius: 40 };
    }
  };

  const sizeDimensions = getSizeDimensions();
  const initialsText = (initials && initials.trim().toUpperCase()) || 'MD';

  return (
    <View style={[styles.container, sizeDimensions]}>
      <View style={[styles.initialsCircle, sizeDimensions]}>
        <Text style={styles.initialsText}>{initialsText}</Text>
      </View>
      <View 
        style={[
          styles.levelBadge,
          {
            width: size === 'small' ? 22 : size === 'large' ? 40 : 30,
            height: size === 'small' ? 22 : size === 'large' ? 40 : 30,
            borderRadius: size === 'small' ? 11 : size === 'large' ? 20 : 15,
            bottom: size === 'small' ? -5 : size === 'large' ? -10 : -8,
            right: size === 'small' ? -5 : size === 'large' ? -10 : -8,
          }
        ]}
      >
        <Text style={styles.levelText}>{level}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  initialsCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderWidth: 3,
    borderColor: '#000000',
  },
  initialsText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 28,
  },
  levelBadge: {
    position: 'absolute',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: -8,
    right: -8,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
  levelText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 12,
  },
});