// types/ai.ts
export type TrainingLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

/**
 * Request payload for AI workout recommendation
 */
export interface AiRecommendationRequest {
  frequency: 1 | 2 | 3 | 4 | 5 | 6;
  lvlOfTraining: TrainingLevel;
}

/**
 * Response from AI recommendation endpoint
 * Matches backend WorkoutRecommendation record
 */
export interface AiRecommendationResponse {
  suggestedWorkoutRoutine: string;
  routineId: string | null;
  description: string;
  difficultyLevel: string;
  workoutSplit: string;
}
