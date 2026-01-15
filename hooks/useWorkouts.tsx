import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SetType } from '@/types/workout.types';

export type WorkoutSet = {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
  setType: SetType;
};

export type WorkoutExercise = {
  exerciseId: string;
  name: string;
  sets: WorkoutSet[];
};

export type Workout = {
  name: string;
  // Optional routine id for better matching
  routineId?: string;
  // Summary strings (legacy)
  sets: string;
  reps: string;
  weight: string;
  // Detailed breakdown (optional)
  details?: WorkoutExercise[];
  timestamp: number;
};

const STORAGE_KEY = 'workouts';

type WorkoutsContextType = {
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'timestamp'>) => Promise<void>;
  upsertTodayWorkout: (match: { name: string; routineId?: string }, data: Omit<Workout, 'timestamp'>) => Promise<void>;
  clearWorkouts: () => Promise<void>;
  loading: boolean;
};

const WorkoutsContext = createContext<WorkoutsContextType | undefined>(undefined);

export const WorkoutsProvider = ({ children }: { children: ReactNode }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setWorkouts(JSON.parse(data));
      }
    } catch (e) {
      console.error('Failed to load workouts', e);
    } finally {
      setLoading(false);
    }
  };

  const addWorkout = async (workout: Omit<Workout, 'timestamp'>) => {
    const newWorkout: Workout = { ...workout, timestamp: Date.now() };
    const updated = [newWorkout, ...workouts];
    setWorkouts(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const upsertTodayWorkout = async (
    match: { name: string; routineId?: string },
    data: Omit<Workout, 'timestamp'>
  ) => {
    const today = new Date().toISOString().split('T')[0];
    let index = -1;
    for (let i = 0; i < workouts.length; i++) {
      const w = workouts[i];
      const wDate = new Date(w.timestamp).toISOString().split('T')[0];
      const sameDay = wDate === today;
      const idMatch = match.routineId ? w.routineId === match.routineId : true;
      const nameMatch = w.name === match.name;
      if (sameDay && nameMatch && idMatch) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      const existing = workouts[index];
      const replaced: Workout = { ...data, timestamp: existing.timestamp } as Workout;
      const updated = [...workouts];
      updated[index] = replaced;
      setWorkouts(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } else {
      await addWorkout(data);
    }
  };

  const clearWorkouts = async () => {
    setWorkouts([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <WorkoutsContext.Provider value={{ workouts, addWorkout, upsertTodayWorkout, clearWorkouts, loading }}>
      {children}
    </WorkoutsContext.Provider>
  );
};

export function useWorkouts() {
  const context = useContext(WorkoutsContext);
  if (!context) {
    throw new Error('useWorkouts must be used within a WorkoutsProvider');
  }
  return context;
}