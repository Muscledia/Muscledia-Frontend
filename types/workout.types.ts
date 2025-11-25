// src/types/workout.types.ts

export enum SetType {
  NORMAL = 'NORMAL',
  WARMUP = 'WARMUP',
  FAILURE = 'FAILURE',
  DROP = 'DROP',
}

export interface WorkoutSet {
  setNumber?: number;
  weightKg?: number;
  reps?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  restSeconds?: number;
  rpe?: number;
  completed?: boolean;
  setType: SetType;  // NEW - replaces warmUp, failure, dropSet
  notes?: string;
  startedAt?: string;
  completedAt?: string;
  volume?: number;
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
  exerciseCategory?: string;
  primaryMuscleGroup?: string;
  sets: WorkoutSet[];
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
