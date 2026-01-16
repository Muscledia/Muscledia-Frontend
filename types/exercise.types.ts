// types/exercise.types.ts
// Exercise-related types

export interface Exercise {
  id: string;
  externalId?: string;
  name: string;
  bodyPart?: string;
  equipment?: string;
  targetMuscle?: string;
  secondaryMuscles?: string[];
  instructions?: string[];
  description?: string;
  difficulty?: string;
  category?: string;
  keywords?: string[];
  imageUrl?: string;
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  usageCount?: number;
  active?: boolean;
}
