// Re-export types defined in the service or move them here if preferred.
// For now, I'll define them here to be cleaner and used by both service and components.

export type RecordType = 'MAX_WEIGHT' | 'MAX_REPS' | 'MAX_VOLUME' | 'ESTIMATED_1RM';

export interface PersonalRecord {
  id: string;
  userId: number;
  exerciseId: string;
  exerciseName: string;
  recordType: RecordType;
  value: number;
  weightKg: number | null;
  reps: number;
  sets: number | null;
  workoutId: string;
  unit: string | null;
  achievedDate: string;
  previousRecord: number;
  improvementPercentage: number | null;
  notes: string | null;
  verified: boolean;
  createdAt: string | null;
  weightRecord: boolean;
  volumeRecord: boolean;
  repsRecord: boolean;
  formattedDescription: string;
}

export interface PRStatistics {
  totalPRs: number;
  prsThisMonth: number;
  prsThisWeek: number;
  lastPRDate: string;
  topExercise: string | null;
  averageImprovement: number;
  prsByType: {
    MAX_WEIGHT: number;
    MAX_REPS: number;
    MAX_VOLUME: number;
    ESTIMATED_1RM?: number;
  };
  significantImprovements: any | null;
  bestImprovement: any | null;
  totalWeightPRs: any | null;
  totalVolumePRs: any | null;
  prFrequency: any | null;
}
