// types/ai.types.ts
// AI recommendation types

export type TrainingLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type WorkoutFrequency = 1 | 2 | 3 | 4 | 5 | 6;

export interface AiRecommendationRequest {
  frequency: WorkoutFrequency;
  lvlOfTraining: TrainingLevel;
}

export interface AiRecommendationResponse {
  suggestedWorkoutRoutine: string;
  routineId: string;
  description: string;
  difficultyLevel: string;
  workoutSplit: string;
}
