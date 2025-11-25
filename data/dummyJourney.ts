import { JourneyNode } from '@/types/journey';

// Define dimensions for the path layout
const START_X = 100;
const START_Y = 100;
const X_GAP = 80;
const Y_GAP = 120;

export const DUMMY_JOURNEY_NODES: JourneyNode[] = [
  // Foundation Phase
  {
    id: 'j1',
    challengeId: 'c1',
    title: 'First Steps',
    status: 'completed',
    position: { x: START_X, y: START_Y },
    prerequisites: [],
    unlocks: ['j2'],
    phase: 'Foundation'
  },
  {
    id: 'j2',
    challengeId: 'c2',
    title: 'Active Start',
    status: 'completed',
    position: { x: START_X + X_GAP, y: START_Y + Y_GAP },
    prerequisites: ['j1'],
    unlocks: ['j3'],
    phase: 'Foundation'
  },
  {
    id: 'j3',
    challengeId: 'c3',
    title: 'Step Counter',
    status: 'completed',
    position: { x: START_X - X_GAP, y: START_Y + Y_GAP * 2 },
    prerequisites: ['j2'],
    unlocks: ['j4'],
    phase: 'Foundation'
  },
  
  // Building Phase
  {
    id: 'j4',
    challengeId: 'c4',
    title: 'Strength Builder',
    status: 'active',
    position: { x: START_X, y: START_Y + Y_GAP * 3 },
    prerequisites: ['j3'],
    unlocks: ['j5', 'j6'],
    phase: 'Building'
  },
  {
    id: 'j5',
    challengeId: 'c5',
    title: 'Push-up Master',
    status: 'locked',
    position: { x: START_X + X_GAP, y: START_Y + Y_GAP * 4 },
    prerequisites: ['j4'],
    unlocks: ['j7'],
    phase: 'Building'
  },
  {
    id: 'j6',
    challengeId: 'c6',
    title: 'Weekly Warrior',
    status: 'locked',
    position: { x: START_X - X_GAP, y: START_Y + Y_GAP * 4 },
    prerequisites: ['j4'],
    unlocks: ['j7'],
    phase: 'Building'
  },

  // Mastery Phase
  {
    id: 'j7',
    challengeId: 'c7',
    title: 'Iron Man',
    status: 'locked',
    position: { x: START_X, y: START_Y + Y_GAP * 5 },
    prerequisites: ['j5', 'j6'],
    unlocks: [],
    phase: 'Mastery'
  }
];

