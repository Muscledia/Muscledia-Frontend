// components/ui/ScreenHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  leftAction?: {
    icon: React.ReactNode;
    onPress: () => void;
  };
  rightAction?: {
    icon: React.ReactNode;
    onPress: () => void;
    disabled?: boolean;
  };
  theme: any;
}

export function ScreenHeader({
                               title,
                               leftAction,
                               rightAction,
                               theme
                             }: ScreenHeaderProps) {
  return (
    <View style={[styles.header, { backgroundColor: theme.background }]}>
      {leftAction ? (
        <TouchableOpacity
          onPress={leftAction.onPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {leftAction.icon}
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

      {rightAction ? (
        <TouchableOpacity
          onPress={rightAction.onPress}
          disabled={rightAction.disabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {rightAction.icon}
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 24,
  },
});
