import { SetType } from '@/types/workout.types';

export interface SetTypeConfig {
  value: SetType;
  label: string;
  color: string;
  description: string;
}

export const SET_TYPE_CONFIGS: SetTypeConfig[] = [
  {
    value: SetType.NORMAL,
    label: 'Normal',
    color: '#4A90E2', // Blue
    description: 'Standard working set',
  },
  {
    value: SetType.WARMUP,
    label: 'Warmup',
    color: '#F5A623', // Orange
    description: 'Lighter weight to prepare muscles',
  },
  {
    value: SetType.DROP,
    label: 'Drop',
    color: '#D0021B', // Red
    description: 'Reduce weight immediately after set',
  },
  {
    value: SetType.FAILURE,
    label: 'Failure',
    color: '#7B16FF', // Purple
    description: 'Perform reps until muscle failure',
  },
];
