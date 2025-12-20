import { Challenge } from '@/types';

export type JourneyNodeStatus = 'completed' | 'active' | 'locked' | 'available';
export type JourneyPhase = 'Foundation' | 'Building' | 'Mastery';
export type JourneyType = 'general-fitness' | 'strength' | 'endurance' | 'weight-loss';

export interface JourneyNode {
  id: string;
  challengeId: string;
  title: string;
  status: JourneyNodeStatus;
  position: { x: number; y: number };
  prerequisites: string[];
  unlocks: string[];
  phase: JourneyPhase;
  challenge?: Challenge; // Optional full challenge data
}

export interface JourneyMapProps {
  nodes: JourneyNode[];
  onNodePress: (node: JourneyNode) => void;
  activeJourneyType: JourneyType;
}

