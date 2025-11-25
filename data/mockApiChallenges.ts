import { Challenge } from '@/types/api';

export const MOCK_API_DAILY_CHALLENGES: Challenge[] = [
  {
    id: "daily-1",
    name: "Push-up Master",
    description: "Complete 50 push-ups today",
    type: "DAILY",
    objective: "REPS",
    targetValue: 50,
    rewardPoints: 100,
    difficulty: "BEGINNER",
    autoEnroll: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    progressUnit: "reps",
    formattedTarget: "50 reps",
    estimatedDuration: "15 min",
    alreadyStarted: false,
    active: true
  },
  {
    id: "daily-2",
    name: "Morning Run",
    description: "Run 3km this morning",
    type: "DAILY",
    objective: "DISTANCE",
    targetValue: 3000,
    rewardPoints: 150,
    difficulty: "INTERMEDIATE",
    autoEnroll: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    progressUnit: "meters",
    formattedTarget: "3 km",
    estimatedDuration: "20 min",
    alreadyStarted: false,
    active: true
  },
  {
    id: "daily-3",
    name: "Plank Challenge",
    description: "Hold a plank for 2 minutes accumulative",
    type: "DAILY",
    objective: "TIME",
    targetValue: 120,
    rewardPoints: 120,
    difficulty: "BEGINNER",
    autoEnroll: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    progressUnit: "seconds",
    formattedTarget: "2 mins",
    estimatedDuration: "5 min",
    alreadyStarted: false,
    active: true
  }
];

export const MOCK_API_WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: "weekly-1",
    name: "Total Body Blast",
    description: "Complete 3 full body workouts this week",
    type: "WEEKLY",
    objective: "WORKOUTS",
    targetValue: 3,
    rewardPoints: 500,
    difficulty: "ADVANCED",
    autoEnroll: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    progressUnit: "workouts",
    formattedTarget: "3 workouts",
    estimatedDuration: "3 hours",
    alreadyStarted: false,
    active: true
  },
  {
    id: "weekly-2",
    name: "Cardio King",
    description: "Run a total of 15km this week",
    type: "WEEKLY",
    objective: "DISTANCE",
    targetValue: 15000,
    rewardPoints: 600,
    difficulty: "INTERMEDIATE",
    autoEnroll: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    progressUnit: "meters",
    formattedTarget: "15 km",
    estimatedDuration: "2 hours",
    alreadyStarted: false,
    active: true
  }
];

