// src/types/workout.types.ts

export enum SetType {
  NORMAL = 'NORMAL',
  WARMUP = 'WARMUP',
  FAILURE = 'FAILURE',
  DROP = 'DROP',
}

export interface WorkoutSet {
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  rpe: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  restSeconds: number | null;
  setType: string;
  completed: boolean;
  notes: string | null;
  volume: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface LogSetRequest {
  weightKg?: number;
  reps?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  restSeconds?: number;
  rpe?: number;
  completed?: boolean;
  setType: SetType;  // NEW
  notes?: string;
}

export interface Exercise {
  exerciseId: string;
  exerciseName: string;
  exerciseOrder: number | null;
  exerciseCategory: string | null;
  primaryMuscleGroup: string | null;
  secondaryMuscleGroups: string[];
  equipment: string | null;
  notes: string | null;
  sets: WorkoutSet[];
  startedAt: string | null;
  completedAt: string | null;
  totalVolume: number;
  totalReps: number;
  maxWeight: number;
  averageRpe: number;
  completedSets: number;
}

export interface Workout {
  id: string;
  userId: number;
  workoutName: string;
  exercises: Exercise[];
  status: string;
  startedAt?: string;
  completedAt?: string;
}


export interface WorkoutSession {
  id: string;
  userId: number;
  workoutName: string;
  workoutPlanId: string;
  workoutType: string;
  status: string;
  exercises: Exercise[];
  metrics: {
    totalVolume: number;
    totalSets: number;
    totalReps: number;
    caloriesBurned: number;
    workedMuscleGroups: string[];
    personalRecordsAchieved: number | null;
  };
  context: {
    location: string | null;
    notes: string | null;
    rating: number | null;
    tags: string[];
  };
  startedAt: string;
  completedAt: string | null;
  durationMinutes: number | null;
}
