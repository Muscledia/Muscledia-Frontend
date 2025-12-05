// components/ui/ErrorState.tsx
import React from 'react';
import { EmptyState } from './EmptyState';
import { Dumbbell } from 'lucide-react-native';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  theme: any;
}

export function ErrorState({ error, onRetry, theme }: ErrorStateProps) {
  return (
    <EmptyState
      icon={<Dumbbell size={64} color={theme.textMuted} />}
      title="Oops! Something went wrong"
      message={error}
      action={{ label: 'Try Again', onPress: onRetry }}
      theme={theme}
    />
  );
}
