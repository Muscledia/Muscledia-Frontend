# Muscledia - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Features](#core-features)
6. [API Integration](#api-integration)
7. [State Management](#state-management)
8. [Components](#components)
9. [Services](#services)
10. [Hooks](#hooks)
11. [Types & Interfaces](#types--interfaces)
12. [Configuration](#configuration)
13. [Development Setup](#development-setup)
14. [Deployment](#deployment)
15. [Known Issues & Future Improvements](#known-issues--future-improvements)

---

## Project Overview

**Muscledia** is a gamified fitness tracking mobile application built with React Native and Expo. The app combines workout tracking with RPG-style character progression, challenges, achievements, and social features to motivate users to maintain consistent fitness routines.

### Key Concepts
- **Gamification**: Users earn XP, level up, unlock badges, and participate in challenges
- **Character System**: Visual avatar that evolves based on fitness progress
- **Workout Tracking**: Comprehensive exercise logging with sets, reps, and weights
- **Social Features**: Leaderboards, leagues, and public routine sharing
- **AI Integration**: Personalized workout recommendations using AI

### Target Platform
- **Primary**: Mobile (iOS & Android)
- **Framework**: Expo (React Native)
- **Backend**: Spring Boot REST API

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Native App                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Screens    │  │  Components  │  │    Hooks     │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                  │          │
│  ┌──────┴─────────────────┴──────────────────┴──────┐   │
│  │              Services Layer                      │   │
│  │  (API calls, data transformation, caching)       │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                               │
│  ┌──────────────────────┴─────────────────────────────┐ │
│  │         State Management (Context API)             │ │
│  │  - AuthProvider, CharacterProvider, etc.           │ │
│  └──────────────────────┬─────────────────────────────┘ │
│                         │                               │
│  ┌──────────────────────┴─────────────────────────────┐ │
│  │         Storage (AsyncStorage)                     │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────┘
                            │
                    ┌───────┴────────┐
                    │  Spring Boot   │
                    │   REST API     │
                    └────────────────┘
```

### Design Patterns
- **Provider Pattern**: Context API for global state management
- **Service Layer Pattern**: Centralized API communication
- **Custom Hooks**: Reusable business logic
- **Component Composition**: Modular, reusable UI components

---

## Technology Stack

### Core Technologies
- **React Native**: 0.81.5
- **React**: 19.1.0
- **Expo SDK**: ~54.0.29
- **TypeScript**: ~5.9.3

### Key Libraries

#### Navigation & Routing
- `expo-router`: ~6.0.20 - File-based routing with typed routes
- `@react-navigation/native`: ^7.1.8
- `@react-navigation/bottom-tabs`: ^7.4.0

#### State Management & Data Fetching
- `@tanstack/react-query`: ^5.90.5 - Server state management
- `@tanstack/react-query-devtools`: ^5.90.2
- React Context API (custom providers)

#### UI & Styling
- `expo-linear-gradient`: ~15.0.8
- `lucide-react-native`: ^0.545.0 - Icon library
- `react-native-reanimated`: ~4.1.2 - Animations
- `react-native-gesture-handler`: ~2.28.0

#### Storage
- `@react-native-async-storage/async-storage`: 2.2.0

#### API Communication
- `axios`: ^1.12.2
- `axios-retry`: ^4.5.0

#### Utilities
- `date-fns`: ^4.1.0
- `expo-haptics`: ~15.0.8 - Haptic feedback
- `expo-notifications`: ~0.32.15
- `react-native-confetti-cannon`: ^1.5.2

#### Development Tools
- `cross-env`: ^10.1.0 - Cross-platform environment variables
- `@babel/core`: ^7.28.4

---

## Project Structure

```
Muscledia-Frontend/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Entry point (redirects to auth/tabs)
│   ├── onboarding.tsx            # First-time user onboarding
│   ├── (auth)/                   # Authentication screens
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # Home/Dashboard
│   │   ├── challenges.tsx        # Challenges screen
│   │   ├── achievements.tsx      # Badges/Achievements
│   │   ├── shop.tsx              # Equipment shop
│   │   └── exercises/            # Exercise-related screens
│   ├── profile.tsx               # User profile
│   ├── profile-settings.tsx      # Profile settings
│   ├── workout-plans/            # Workout plan management
│   │   ├── create.tsx
│   │   └── [planId]/
│   ├── workout-session/           # Active workout tracking
│   │   ├── [planId].tsx
│   │   └── log-set.tsx
│   ├── routine-detail/           # Routine details
│   │   └── [id]/
│   ├── public-routines.tsx       # Browse public routines
│   ├── ai-recommendation/        # AI workout recommendations
│   ├── leaderboard.tsx           # Leaderboards
│   ├── leagues.tsx               # League system
│   └── personal-records.tsx      # Personal records tracking
│
├── components/                   # Reusable UI components
│   ├── CharacterAvatar.tsx       # Character display
│   ├── CharacterDisplay.tsx      # Enhanced character visualization
│   ├── ProgressBar.tsx           # Progress indicators
│   ├── StatsCard.tsx             # Stat display cards
│   ├── SetTypeSelector.tsx       # Set type selection
│   ├── WorkoutAnalytics.tsx      # Workout statistics
│   ├── challenges/               # Challenge-related components
│   ├── exercises/                # Exercise components
│   ├── leaderboard/              # Leaderboard components
│   ├── pr/                       # Personal records components
│   ├── routines/                 # Routine components
│   ├── ui/                       # Generic UI components
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.tsx               # Authentication state
│   ├── useCharacter.tsx          # Character state management
│   ├── useWorkouts.tsx           # Workout tracking
│   ├── useRoutines.tsx           # Routine management
│   ├── useChallenges.tsx         # Challenge system
│   ├── useLeaderboard.tsx        # Leaderboard data
│   ├── useLeagues.tsx            # League system
│   ├── useNotifications.tsx      # Push notifications
│   ├── useHaptics.ts             # Haptic feedback
│   └── ...
│
├── services/                     # API service layer
│   ├── api.ts                    # Base API client
│   ├── authService.ts            # Authentication
│   ├── userService.ts            # User management
│   ├── workoutPlanService.ts     # Workout plans
│   ├── WorkoutService.ts         # Workout sessions
│   ├── exerciseService.ts        # Exercise data
│   ├── routineService.ts         # Routines
│   ├── challengeService.ts       # Challenges
│   ├── gamificationService.ts    # Gamification profile
│   ├── badgeService.ts           # Badges/achievements
│   ├── leaderboardService.ts     # Leaderboards
│   ├── aiService.ts              # AI recommendations
│   ├── personalRecordsService.ts # Personal records
│   └── storageService.ts         # Local storage wrapper
│
├── types/                        # TypeScript type definitions
│   ├── index.ts                  # Central type exports
│   ├── api.ts                    # API response types
│   ├── auth.types.ts             # Authentication types
│   ├── workout.types.ts           # Workout types
│   ├── exercise.types.ts         # Exercise types
│   ├── gamification.types.ts     # Gamification types
│   ├── ai.types.ts               # AI recommendation types
│   └── personalRecords.ts        # Personal records types
│
├── config/                       # Configuration files
│   └── api.ts                    # API configuration & endpoints
│
├── constants/                    # App constants
│   ├── Colors.ts                 # Theme colors
│   ├── Assets.ts                 # Asset paths
│   └── setTypes.ts               # Set type definitions
│
├── utils/                        # Utility functions
│   └── helpers.ts                # Helper functions
│
├── data/                         # Static data
│
├── providers/                    # React providers
│   └── QueryProvider.tsx         # React Query setup
│
├── assets/                       # Static assets
│   ├── images/                   # Images
│   ├── characters/               # Character sprites
│   ├── clothes/                  # Clothing assets
│   ├── equipment/                # Equipment images
│   └── backgrounds/              # Background images
│
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project readme
```

---

## Core Features

### 1. Authentication System
- **Login/Register**: Email-based authentication
- **Token Management**: JWT token storage and refresh
- **Session Persistence**: Automatic login on app restart
- **Protected Routes**: Route guards for authenticated screens

**Implementation**: `hooks/useAuth.tsx`, `services/authService.ts`

### 2. Character System
The character is the core gamification element that represents the user's fitness journey.

#### Character Attributes
- **Level**: Increases with XP gain (starts at 1)
- **XP System**: 
  - Base XP requirement: 100 for level 2
  - Exponential growth: `100 * (1.2 ^ (level - 1))`
  - XP gained from workouts, challenges, achievements
- **Health System**:
  - Max health: 50 (base)
  - Health consumed during workouts
  - Regenerates over time
- **Streaks**: 
  - Daily workout streaks
  - Weekly streaks
  - Monthly streaks

#### Character Evolution
- **Stages**: Character appearance changes based on level
  - Stage 1 (Levels 1-4): Beginner
  - Stage 2 (Levels 5-14): Intermediate
  - Stage 3 (Levels 15-29): Advanced
  - Stage 4 (Levels 30+): Master

#### Customization
- Skin color (3 variants)
- Clothing (shirts, pants)
- Equipment (barbells, dumbbells)
- Accessories
- Backgrounds

**Implementation**: `hooks/useCharacter.tsx`, `components/CharacterDisplay.tsx`

### 3. Workout Tracking

#### Workout Plans
- Create custom workout plans
- Add exercises with sets, reps, weight
- Organize into routine folders
- Public/private sharing

#### Workout Sessions
- Start workout from plan
- Log sets in real-time
- Track completion
- Set types: Regular, Drop Set, Super Set, Rest Pause
- Auto-save progress

#### Exercise Library
- Browse exercises by muscle group
- Filter by equipment type
- Search functionality
- Exercise details (instructions, muscle groups)

**Implementation**: 
- `services/workoutPlanService.ts`
- `services/WorkoutService.ts`
- `app/workout-session/[planId].tsx`

### 4. Challenge System

#### Daily Challenges
- Available daily challenges
- Accept and complete challenges
- XP and point rewards
- Progress tracking

#### Weekly Challenges
- Longer-term objectives
- Higher rewards
- Weekly reset

#### Interactive Challenges
- Real-time challenge cards
- Progress visualization
- Completion celebrations

**Implementation**: 
- `hooks/useDailyChallenges.ts`
- `hooks/useWeeklyChallenges.ts`
- `components/challenges/`

### 5. Gamification Features

#### Badges & Achievements
- Multiple badge types:
  - Exercise badges
  - Champion badges
  - Streak badges
  - Personal Record badges
- Badge criteria:
  - Workout count
  - Level reached
  - Streak milestones
  - Points earned
  - Exercise-specific achievements

#### Leaderboards
- Multiple leaderboard types:
  - Points leaderboard
  - Level leaderboard
  - Weekly streak leaderboard
- Real-time updates
- User ranking display

#### Leagues
- Division-based competition
- Promotion/relegation system
- League-specific rewards

**Implementation**: 
- `services/badgeService.ts`
- `services/leaderboardService.ts`
- `hooks/useLeagues.tsx`

### 6. Routine System
- **Routine Folders**: Organize multiple workout plans
- **Public Routines**: Browse and save community routines
- **Routine Builder**: Create custom routines
- **Difficulty Levels**: Beginner, Intermediate, Advanced
- **Equipment Types**: Gym, Equipment-Free, Mixed
- **Workout Splits**: Full Body, Upper/Lower, Push/Pull/Legs, etc.

**Implementation**: `services/routineService.ts`, `hooks/useRoutines.tsx`

### 7. AI Recommendations
- Personalized workout recommendations
- Based on user goals, experience, equipment
- Integration with Ollama AI service
- Customizable parameters

**Implementation**: `services/aiService.ts`, `app/ai-recommendation/`

### 8. Personal Records
- Track PRs for exercises
- Weight, reps, volume records
- Historical tracking
- Statistics visualization

**Implementation**: `services/personalRecordsService.ts`, `components/pr/`

### 9. Shop System
- Purchase equipment with coins
- Character customization items
- Backgrounds and accessories
- Economy system (coins earned from workouts)

**Implementation**: `app/(tabs)/shop.tsx`

### 10. Notifications
- Push notifications for:
  - Challenge reminders
  - Streak warnings
  - Achievement unlocks
  - Daily goals

**Implementation**: `hooks/useNotifications.tsx`

---

## API Integration

### API Configuration
Located in `config/api.ts`

#### Base URL Configuration
- **Development**: 
  - iOS: `http://89.168.117.65:8080`
  - Android: `http://10.0.2.2:8080`
  - Web: `http://192.168.1.64:8080`
- **Production**: `http://89.168.117.65:8080`
- **Environment Variable**: `EXPO_PUBLIC_API_URL`

#### API Endpoints

##### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration

##### User Management
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user profile
- `GET /api/users/{id}` - Get user by ID

##### Workouts
- `GET /api/v1/exercises` - Get exercise library
- `GET /api/v1/workout-plans` - Get workout plans
- `GET /api/v1/workout-plans/{id}` - Get workout plan details
- `POST /api/v1/workout-plans` - Create workout plan
- `PUT /api/v1/workout-plans/{id}` - Update workout plan
- `DELETE /api/v1/workout-plans/{id}` - Delete workout plan
- `POST /api/v1/workout-sessions` - Create workout session
- `PUT /api/v1/workout-sessions/{id}/sets/{setId}` - Update set

##### Routines
- `GET /api/v1/routine-folders/public` - Get public routines
- `GET /api/v1/routine-folders/{id}` - Get routine folder
- `POST /api/v1/routine-folders/save/{id}` - Save routine
- `GET /api/v1/routine-folders/is-saved/{id}` - Check if saved

##### Gamification
- `GET /api/gamification/profile` - Get gamification profile
- `GET /api/gamification/streaks` - Get streak information
- `GET /api/gamification/achievements` - Get achievements
- `GET /api/gamification/badges` - Get badge catalog
- `GET /api/gamification/leaderboard` - Get leaderboard
- `GET /api/gamification/leaderboards/points` - Points leaderboard
- `GET /api/gamification/leaderboards/levels` - Level leaderboard
- `GET /api/gamification/leaderboards/weekly-streak` - Weekly streak leaderboard

##### Challenges
- `GET /api/challenges/daily` - Get daily challenges
- `GET /api/challenges/weekly` - Get weekly challenges
- `GET /api/challenges/active` - Get active user challenges
- `POST /api/challenges/{id}/accept` - Accept challenge
- `PUT /api/challenges/{id}/progress` - Update challenge progress

##### AI
- `POST /ollama/getRecommendation` - Get AI workout recommendation

### API Client Features
- **Automatic Retry**: 3 attempts with exponential backoff
- **Request Timeout**: 30 seconds (120 seconds for AI)
- **Token Management**: Automatic token injection
- **Error Handling**: Centralized error handling
- **Response Caching**: Service-level caching (TTL-based)

**Implementation**: `services/api.ts`

---

## State Management

### Context Providers
The app uses React Context API for global state management:

1. **QueryProvider**: React Query setup for server state
2. **AuthProvider**: Authentication state
3. **CharacterProvider**: Character data and progression
4. **WorkoutsProvider**: Workout history and sessions
5. **RoutineProvider**: Routine management
6. **RaidProvider**: Raid/challenge system
7. **LeaguesProvider**: League system
8. **NotificationsProvider**: Notification management

### React Query
Used for:
- Server state caching
- Automatic refetching
- Optimistic updates
- Background synchronization

### Local State
- Component-level state with `useState`
- Form state management
- UI state (modals, loading, etc.)

---

## Components

### Core Components

#### CharacterDisplay
Enhanced character visualization with:
- Stage-based appearance
- Equipment rendering
- Animation support
- Customization display

**Location**: `components/CharacterDisplay.tsx`

#### ProgressBar
Reusable progress indicator for:
- XP progress
- Challenge progress
- Health bars
- Custom metrics

**Location**: `components/ProgressBar.tsx`

#### Challenge Components
- `InteractiveChallengeCard`: Real-time challenge display
- `ActiveChallengeCard`: Active challenge tracking
- `CelebrationScreen`: Completion animations
- `ChallengeCompletionModal`: Reward display

**Location**: `components/challenges/`

#### Exercise Components
- Exercise cards
- Exercise filters
- Exercise details
- Set logging interface

**Location**: `components/exercises/`

### Component Patterns
- **Composition**: Small, focused components
- **Props Interface**: Strong TypeScript typing
- **Theme Support**: Dynamic theming via `getThemeColors()`
- **Accessibility**: Proper accessibility labels

---

## Services

### Service Architecture
All services follow a consistent pattern:
- Static methods for API calls
- Caching with TTL
- Error handling
- Type-safe responses

### Key Services

#### AuthService
- Login/register
- Token management
- User session

#### WorkoutPlanService
- CRUD operations for workout plans
- Exercise management
- Plan details

#### WorkoutService
- Session creation
- Set logging
- Progress tracking

#### GamificationService
- Profile fetching
- Streak information
- Caching (5-minute TTL)

#### BadgeService
- Badge catalog
- Badge status
- Progress calculation
- Caching (15-minute TTL)

#### ChallengeService
- Daily/weekly challenges
- Challenge acceptance
- Progress updates

#### AiService
- AI recommendations
- Extended timeout (120s)
- Request/response logging

---

## Hooks

### Custom Hooks Overview

#### useAuth
Authentication state and methods:
- `user`: Current user data
- `login(email, password)`: Login function
- `register(email, password, username)`: Registration
- `logout()`: Logout function
- `isAuthenticated`: Auth status

#### useCharacter
Character state management:
- `character`: Character data
- `updateCharacter()`: Update character
- `incrementXP()`: Add XP (with stat modifiers)
- `consumeHealth()`: Health management
- `addCoins()`: Economy functions
- `purchaseItem()`: Shop integration

#### useWorkouts
Workout tracking:
- Workout history
- Active sessions
- Statistics

#### useRoutines
Routine management:
- User routines
- Public routines
- Save/unsave routines

#### useDailyChallenges / useWeeklyChallenges
Challenge data fetching with React Query

#### useActiveChallenges
Active user challenges with progress tracking

#### useLeaderboard
Leaderboard data with multiple types

#### useLeagues
League system state

#### useHaptics
Haptic feedback wrapper:
- `impact()`: Haptic feedback
- `notification()`: Notification haptics
- `success()`: Success haptics

#### useNotifications
Push notification management

---

## Types & Interfaces

### Core Types

#### Character
```typescript
type Character = {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  streak: number;
  maxHealth: number;
  currentHealth: number;
  coins: number;
  // ... customization fields
}
```

#### WorkoutPlan
```typescript
interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  exercises: PlannedExercise[];
  targetMuscleGroups: string[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
```

#### GamificationProfile
```typescript
interface GamificationProfile {
  id: string;
  userId: number;
  points: number;
  level: number;
  streaks: {
    workout: WorkoutStreak;
  };
  earnedBadges: EarnedBadge[];
  totalWorkoutsCompleted: number;
  // ... more fields
}
```

#### Challenge
```typescript
interface Challenge {
  challengeId: string;
  name: string;
  description: string;
  challengeType: 'DAILY' | 'WEEKLY' | 'INTERACTIVE';
  pointsReward: number;
  xpReward: number;
  criteria: ChallengeCriteria;
}
```

**Location**: `types/` directory

---

## Configuration

### Expo Configuration (`app.json`)
- **App Name**: Muscledia
- **Version**: 1.0.0
- **Orientation**: Portrait
- **New Architecture**: Enabled
- **Plugins**: 
  - expo-router
  - expo-font
  - expo-web-browser
  - expo-notifications

### TypeScript Configuration
- Strict mode enabled
- Path aliases: `@/` for `./` root
- React Native types included

### Environment Variables
- `EXPO_PUBLIC_API_URL`: Backend API URL
- `EXPO_PUBLIC_ENV`: Environment (development/production)

---

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Physical device with Expo Go app (optional)

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd Muscledia-Frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment** (Optional)
   Create `.env` file:
   ```
   EXPO_PUBLIC_API_URL=http://your-api-url:8080
   EXPO_PUBLIC_ENV=development
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Run on Device/Emulator**
   - Scan QR code with Expo Go app
   - Or press `i` for iOS / `a` for Android

### Development Scripts
- `npm run dev`: Start Expo development server
- `npm run build:web`: Build for web
- `npm run lint`: Run ESLint

### Code Structure Guidelines
- **Screens**: Located in `app/` directory (file-based routing)
- **Components**: Reusable components in `components/`
- **Services**: API communication in `services/`
- **Hooks**: Custom hooks in `hooks/`
- **Types**: TypeScript definitions in `types/`

---

## Deployment

### Building for Production

#### iOS
```bash
eas build --platform ios
```

#### Android
```bash
eas build --platform android
```

### Environment Configuration
- Set `EXPO_PUBLIC_API_URL` to production URL
- Set `EXPO_PUBLIC_ENV=production`

### Backend Requirements
Ensure backend API is:
- Accessible from mobile devices
- CORS configured (for web)
- SSL/TLS enabled (production)

---

## Known Issues & Future Improvements

### Known Issues
1. **Missing Backend Endpoints**: Some endpoints return 404 (see `BACKEND_ENDPOINTS_NEEDED.md`)
   - `GET /api/v1/routine-folders/{id}`
   - `GET /api/v1/workout-plans/{id}`
   - `GET /api/v1/routine-folders/is-saved/{id}`

2. **API URL Configuration**: Port handling needs improvement for iOS devices

3. **Offline Support**: Limited offline functionality

### Future Improvements
1. **Offline Mode**: Full offline workout tracking with sync
2. **Social Features**: Friend system, workout sharing
3. **Advanced Analytics**: Detailed workout analytics and insights
4. **Workout Templates**: Pre-built workout templates
5. **Video Integration**: Exercise demonstration videos
6. **Nutrition Tracking**: Meal logging and macros
7. **Wearable Integration**: Apple Watch, Fitbit support
8. **Multi-language Support**: Internationalization
9. **Dark Mode Polish**: Enhanced dark mode theming
10. **Performance Optimization**: Code splitting, lazy loading

---

## Additional Resources

### Documentation Files
- `README.md`: Quick start guide
- `BACKEND_ENDPOINTS_NEEDED.md`: Missing API endpoints
- `ERROR_ANALYSIS.md`: Error handling documentation

### External Dependencies
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

---

## Conclusion

Muscledia is a comprehensive fitness tracking application that combines workout logging with gamification elements to create an engaging user experience. The app is built with modern React Native and Expo technologies, following best practices for code organization, type safety, and user experience.

The architecture is designed to be scalable and maintainable, with clear separation of concerns between UI, business logic, and data layers. The extensive use of TypeScript ensures type safety throughout the application.

For questions or contributions, please refer to the project repository and follow the established coding patterns and conventions.

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Maintained By**: Development Team
