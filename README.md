# MuscldDia v1 🏋️‍♂️

A gamified fitness tracking mobile app built with React Native and Expo, featuring an RPG-style character progression system that motivates users to maintain consistent workout routines.

## Developer Documentation

For a full architecture and implementation guide, see `docs/ARCHITECTURE.md`.

For server-side contracts, see `docs/BACKEND_API.md`.

## ✨ Features

### 🎮 Gamification System
- **Character Avatar**: Visual representation that evolves with your fitness level
- **Level Progression**: Gain XP through workouts and level up your character
- **Streak System**: Build workout streaks with visual flame effects
- **Achievement Badges**: Unlock accomplishments as you progress

### 💪 Workout Tracking
- **Exercise Library**: Browse and track various exercises
- **Workout History**: View your recent workout sessions
- **Progress Tracking**: Monitor sets, reps, and weights
- **Personalized Stats**: Track total XP and level ups

### 📱 User Experience
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Responsive Design**: Optimized for all screen sizes
- **Smooth Animations**: Engaging visual feedback and transitions
- **Persistent Data**: Local storage with AsyncStorage

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd musclediav1-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   > **Note for Windows users**: The project now uses `cross-env` for cross-platform environment variable support.

4. **Run on device/emulator**
   - Install Expo Go app on your mobile device
   - Scan the QR code displayed in terminal
   - Or press `i` for iOS simulator / `a` for Android emulator

## 📱 App Structure

### Main Screens
- **Home**: Dashboard with character status, stats, and recent workouts
- **Exercises**: Browse exercise library and track workouts  
- **Challenges**: View and complete daily, weekly, and interactive challenges
- **Achievements**: Display unlocked badges and progress
- **Profile**: Character customization and personal stats

### Key Components
- `CharacterAvatar`: Animated avatar with level progression
- `ProgressBar`: Visual XP and progress indicators
- `StatsCard`: Reusable stat display components

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router with typed routes
- **State Management**: React Context API with custom hooks
- **Storage**: AsyncStorage for data persistence
- **Styling**: StyleSheet with dynamic theming
- **Icons**: Lucide React Native icons
- **Animations**: React Native Animated API

## 📊 Character System

### Leveling
- Start at Level 1 with 100 XP needed for Level 2
- XP requirements increase by 20% each level
- Complete workouts and challenges to gain XP

### Streaks
- Track consecutive workout days
- Visual flame effects for 3+ day streaks
- Streak resets if a day is missed

### Avatar Evolution
- Character appearance changes based on level:
  - Beginner (Levels 1-4)
  - Intermediate (Levels 5-14)  
  - Advanced (Levels 15-29)
  - Master (Level 30+)

## 🗂️ Project Structure

```
musclediav1/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # Home screen
│   │   ├── exercises/          # Exercise screens
│   │   ├── challenges.tsx      # Challenges screen
│   │   ├── achievements.tsx    # Achievements screen
│   │   └── profile.tsx         # Profile screen
│   └── _layout.tsx
├── components/
│   ├── CharacterAvatar.tsx     # Animated character component
│   ├── ProgressBar.tsx         # XP progress visualization
│   └── StatsCard.tsx           # Stat display component
├── hooks/
│   ├── useCharacter.tsx        # Character state management
│   ├── useWorkouts.tsx         # Workout tracking
│   └── useFrameworkReady.ts    # App initialization
├── data/
│   └── badges.ts               # Achievement badges
└── utils/
    └── helpers.ts              # Utility functions
```

## 🔧 Configuration

### Environment Setup
- Expo SDK 53+
- React Native 0.79+
- TypeScript support enabled
- Metro bundler configuration

### Customization
- Add new achievements in `data/badges.ts`
- Customize character avatars in `components/CharacterAvatar.tsx`
- Adjust XP calculations in `hooks/useCharacter.tsx`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- This project was updated from [Ivan Andrau's fork](https://github.com/IvanAndrau/musclediav1) with improvements and cross-platform compatibility fixes
- Expo team for the excellent development platform
- Lucide for the beautiful icon library
- React Native community for the robust ecosystem
