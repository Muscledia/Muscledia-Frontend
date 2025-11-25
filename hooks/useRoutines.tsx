import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SetType } from '@/types/workout.types';

type Exercise = {
  id: string;
  name: string;
  sets: Array<{
    id: string;
    reps: number;
    weight: number;
    completed: boolean;
    setType: SetType;
  }>;
};

type Routine = {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
  lastModified: string;
};

type RoutineContextType = {
  routines: Routine[];
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'lastModified'>) => Promise<void>;
  updateRoutine: (id: string, routine: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  getRoutine: (id: string) => Routine | undefined;
  markSetCompleted: (routineId: string, exerciseId: string, setId: string, completed: boolean) => Promise<void>;
};

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

export function RoutineProvider({ children }: { children: React.ReactNode }) {
  const [routines, setRoutines] = useState<Routine[]>([]);

  // Load routines from storage
  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_routines');
      if (stored) {
        setRoutines(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading routines:', error);
    }
  };

  const saveRoutines = async (newRoutines: Routine[]) => {
    try {
      await AsyncStorage.setItem('user_routines', JSON.stringify(newRoutines));
      setRoutines(newRoutines);
    } catch (error) {
      console.error('Error saving routines:', error);
    }
  };

  const addRoutine = async (routineData: Omit<Routine, 'id' | 'createdAt' | 'lastModified'>) => {
    const newRoutine: Routine = {
      ...routineData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    
    const updatedRoutines = [...routines, newRoutine];
    await saveRoutines(updatedRoutines);
  };

  const updateRoutine = async (id: string, updates: Partial<Routine>) => {
    const updatedRoutines = routines.map(routine =>
      routine.id === id
        ? { ...routine, ...updates, lastModified: new Date().toISOString() }
        : routine
    );
    await saveRoutines(updatedRoutines);
  };

  const deleteRoutine = async (id: string) => {
    const updatedRoutines = routines.filter(routine => routine.id !== id);
    await saveRoutines(updatedRoutines);
  };

  const getRoutine = (id: string) => {
    return routines.find(routine => routine.id === id);
  };

  const markSetCompleted = async (routineId: string, exerciseId: string, setId: string, completed: boolean) => {
    const updatedRoutines = routines.map(routine => {
      if (routine.id === routineId) {
        const updatedExercises = routine.exercises.map(exercise => {
          if (exercise.id === exerciseId) {
            const updatedSets = exercise.sets.map(set =>
              set.id === setId ? { ...set, completed } : set
            );
            return { ...exercise, sets: updatedSets };
          }
          return exercise;
        });
        return { ...routine, exercises: updatedExercises, lastModified: new Date().toISOString() };
      }
      return routine;
    });
    await saveRoutines(updatedRoutines);
  };

  return (
    <RoutineContext.Provider value={{
      routines,
      addRoutine,
      updateRoutine,
      deleteRoutine,
      getRoutine,
      markSetCompleted,
    }}>
      {children}
    </RoutineContext.Provider>
  );
}

export function useRoutines() {
  const context = useContext(RoutineContext);
  if (context === undefined) {
    throw new Error('useRoutines must be used within a RoutineProvider');
  }
  return context;
} 