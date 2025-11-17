# Routine Detail Screen

## Overview
The Routine Detail Screen displays comprehensive information about a selected routine folder and lists all workout plans contained within it. Users can view detailed information, browse workout plans, and save routines to their personal collection.

## Files Created

### Screens
1. **`app/routine-detail/[id].tsx`** - Main detail screen with dynamic routing

### Components
1. **`components/routines/RoutineHeader.tsx`** - Displays routine folder header with metadata
2. **`components/routines/WorkoutPlanCard.tsx`** - Individual workout plan card component
3. **`components/routines/WorkoutPlanList.tsx`** - List container for workout plans
4. **`components/routines/SaveRoutineButton.tsx`** - Button to save routine to user's collection
5. **`components/routines/index.ts`** - Export barrel for easy imports

### Services
1. **`services/workoutPlanService.ts`** - API service for workout plan operations

### Modified Files
1. **`types/api.ts`** - Added `RoutineFolder` and `WorkoutPlan` interfaces
2. **`config/api.ts`** - Added workout plans endpoints
3. **`app/public-routines.tsx`** - Updated navigation to detail screen
4. **`services/index.ts`** - Added new service exports

## API Integration

### Endpoints Used

#### 1. Get Routine Folder by ID
- **URL**: `GET /api/v1/routine-folders/{id}`
- **Authentication**: Not required for public routines
- **Response**: `ApiResponse<RoutineFolder>`

#### 2. Get Workout Plans by Routine Folder
- **URL**: `GET /api/v1/workout-plans?routineFolderId={id}`
- **Authentication**: Not required for public routines
- **Response**: `ApiResponse<WorkoutPlan[]>`

### Data Models

#### RoutineFolder
```typescript
interface RoutineFolder {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  duration: string;
  imageUrl?: string;
  isPublic: boolean;
  createdBy: string;
}
```

#### WorkoutPlan
```typescript
interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  targetMuscleGroups: string[];
  estimatedDuration: number; // in minutes
  difficulty: string;
  exerciseCount: number;
  routineFolderId?: string;
}
```

## Features Implemented

### ✅ Core Requirements
1. **Routine Header** - Displays:
   - Hero image or gradient placeholder
   - Routine name and description
   - Difficulty badge (color-coded)
   - Duration information
   - Creator username
   
2. **Workout Plans List** - Shows:
   - List of all workout plans in the routine
   - Each plan displays name, description, target muscles, duration, and difficulty
   - Empty state when no plans available
   
3. **Workout Plan Cards** - Include:
   - Plan name and description
   - Target muscle groups with icon
   - Estimated duration
   - Exercise count
   - Difficulty badge
   
4. **Save Button** - Features:
   - Fixed at bottom of screen
   - Shows loading state during save
   - Changes to "Saved" state after successful save
   - Includes bookmark icon
   
5. **Navigation** - Supports:
   - Tap workout plan to view details (prepared for future implementation)
   - Back button to return to previous screen
   
6. **States** - Handles:
   - Loading state with spinner
   - Error state with retry button
   - Empty state (no data)
   - Pull-to-refresh functionality

## Component Structure

### RoutineDetailScreen (Main Screen)
```
app/routine-detail/[id].tsx
├── Header (Back button + Title)
├── ScrollView (Refreshable)
│   ├── RoutineHeader
│   │   ├── Hero Image/Gradient
│   │   └── Metadata (difficulty, duration, creator)
│   └── WorkoutPlanList
│       └── WorkoutPlanCard (multiple)
│           ├── Title & Description
│           ├── Target Muscle Groups
│           └── Stats (duration, exercises, difficulty)
└── SaveRoutineButton (Fixed Bottom)
```

## Usage

### Accessing the Screen

From the public routines list:
```typescript
router.push(`/routine-detail/${routineFolder.id}`);
```

### Using Services

```typescript
import { RoutineFolderService, WorkoutPlanService } from '@/services';

// Fetch routine folder
const folderResponse = await RoutineFolderService.getRoutineFolderById(id);

// Fetch workout plans
const plansResponse = await WorkoutPlanService.getWorkoutPlansByRoutineFolder(id);
```

### Using Components

```typescript
import { 
  RoutineHeader, 
  WorkoutPlanList, 
  SaveRoutineButton 
} from '@/components/routines';

// In your component
<RoutineHeader routineFolder={routineFolder} />
<WorkoutPlanList 
  workoutPlans={workoutPlans} 
  onWorkoutPlanPress={handlePress} 
/>
<SaveRoutineButton 
  routineFolderId={id} 
  onSave={handleSave} 
/>
```

## UI/UX Details

### RoutineHeader
- **Hero Section**: Full-width image (200px height) or gradient placeholder
- **Content Section**: Padding 16px, contains title, description, and metadata
- **Difficulty Badge**: Color-coded (green/yellow/red) with 20% opacity background
- **Metadata Chips**: Rounded pills with icons for duration and creator

### WorkoutPlanCard
- **Layout**: Full-width card with 16px padding, 16px border radius
- **Spacing**: 12px margin bottom between cards
- **Title**: Bold, 18px, truncated to 2 lines
- **Description**: 14px, secondary color, truncated to 2 lines
- **Target Muscles**: Row with target icon and comma-separated list
- **Stats Row**: Flex row with duration, exercise count, and difficulty
- **Shadow**: Subtle elevation with 0.2 opacity

### SaveRoutineButton
- **Position**: Fixed at bottom with padding 16px horizontal, 32px bottom
- **States**:
  - Default: Golden accent color with "Save to My Routines" + bookmark icon
  - Loading: Shows spinner with "Saving..." text
  - Saved: 40% opacity with "Saved to My Routines" + check icon
- **Haptics**: Medium impact on press
- **Shadow**: Strong elevation (0.3 opacity, 8px radius)

## Theme Integration

All components use the dark mode theme:
- **Background**: `theme.background`
- **Surface**: `theme.surface` for cards
- **Text**: `theme.text` (primary), `theme.textSecondary` (descriptions)
- **Accent**: Golden `theme.accent` for interactive elements
- **Surface Light**: `theme.surfaceLight` for metadata chips

## States & Error Handling

### Loading State
- Full-screen centered spinner
- "Loading routine details..." message
- Header remains visible

### Error State
- Centered error icon (96x96 circle)
- Error title: "Oops! Something went wrong"
- Descriptive error message
- "Try Again" button to retry

### Empty State (No Workout Plans)
- Shows in workout plans section
- Message: "No workout plans available in this routine."
- Routine header still displays normally

### Pull-to-Refresh
- Native RefreshControl component
- Themed to match app (accent color)
- Light haptic feedback on pull

## Future Enhancements

### Immediate Next Steps
1. **Workout Plan Detail Screen** - Create detail screen for individual workout plans
2. **Save API Integration** - Implement backend API for saving routines
3. **Auth Check** - Require authentication for saving routines

### Future Features
1. **Preview Mode** - Quick preview of exercises in workout plan
2. **Favorites** - Mark specific workout plans as favorites
3. **Share** - Share routine with friends
4. **Comments/Reviews** - User feedback on routines
5. **Progress Tracking** - Show user's progress through routine
6. **Recommendations** - Similar routines based on difficulty/goals
7. **Video Previews** - Embedded video demonstrations
8. **Schedule Integration** - Add routine to workout calendar
9. **Analytics** - Track popularity and completion rates
10. **Offline Mode** - Cache routine data for offline viewing

## Navigation Flow

```
Public Routines Screen
    ↓ (Tap routine card)
Routine Detail Screen ← YOU ARE HERE
    ↓ (Tap workout plan)
Workout Plan Detail Screen (TODO)
    ↓ (Tap exercise)
Exercise Detail Screen (Existing)
```

## Testing

### Manual Testing Checklist

#### Loading & Navigation
- [ ] Screen loads when navigating from public routines
- [ ] Loading spinner appears during data fetch
- [ ] Back button navigates to previous screen
- [ ] Pull-to-refresh works correctly

#### Data Display
- [ ] Routine header shows all information correctly
- [ ] Hero image displays (or gradient fallback)
- [ ] Difficulty badge shows correct color
- [ ] Duration and creator display properly
- [ ] Workout plans list shows all plans
- [ ] Each card displays complete information
- [ ] Target muscle groups formatted correctly

#### Interactions
- [ ] Workout plan cards are tappable (logs to console)
- [ ] Save button changes state on press
- [ ] Haptic feedback works on all interactions
- [ ] Loading state shows during save

#### Error Handling
- [ ] Error state displays on network failure
- [ ] Retry button works to refetch data
- [ ] Empty state shows when no workout plans exist
- [ ] Invalid ID shows appropriate error

#### Edge Cases
- [ ] Long routine names truncate properly
- [ ] Long descriptions show correctly (2 lines)
- [ ] Many workout plans scroll smoothly
- [ ] No muscle groups - section hidden gracefully
- [ ] Missing image shows gradient fallback

### Backend Requirements

Ensure your backend returns data in these formats:

#### GET /api/v1/routine-folders/{id}
```json
{
  "success": true,
  "message": "Routine folder retrieved successfully",
  "data": {
    "id": "uuid-here",
    "name": "Beginner Full Body Program",
    "description": "A comprehensive 12-week program...",
    "difficulty": "Beginner",
    "duration": "12 weeks",
    "imageUrl": "https://example.com/image.jpg",
    "isPublic": true,
    "createdBy": "coach_mike"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### GET /api/v1/workout-plans?routineFolderId={id}
```json
{
  "success": true,
  "message": "Workout plans retrieved successfully",
  "data": [
    {
      "id": "plan-uuid-1",
      "name": "Upper Body Strength",
      "description": "Focus on building upper body strength...",
      "targetMuscleGroups": ["Chest", "Back", "Shoulders"],
      "estimatedDuration": 60,
      "difficulty": "Beginner",
      "exerciseCount": 8,
      "routineFolderId": "routine-uuid"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Performance Considerations

- **Parallel Requests**: Routine folder and workout plans fetched simultaneously (could be optimized)
- **Image Loading**: Lazy loading with fallback gradients
- **List Rendering**: Using key props for efficient React rendering
- **State Management**: Local state with cleanup on unmount
- **Refresh Logic**: Prevents double-loading during refresh

## Accessibility

- **Touch Targets**: All buttons minimum 44x44 points
- **Color Contrast**: Sufficient contrast for readability
- **Feedback**: Visual and haptic feedback for interactions
- **Error Messages**: Clear and actionable
- **Loading States**: Informative loading messages

## Troubleshooting

### Issue: Screen shows "Routine not found"
- Verify the routine ID is valid
- Check API response structure
- Ensure backend returns correct data

### Issue: Workout plans not loading
- Check console for API errors
- Verify endpoint returns correct format
- Empty array is valid (shows empty state)

### Issue: Save button doesn't work
- Currently placeholder implementation
- Check console logs for save events
- Implement actual API when backend ready

### Issue: Images not loading
- Verify imageUrl is valid and accessible
- Check CORS settings
- Gradient fallback should still work

## Related Documentation
- [Public Routines Feature](./PUBLIC_ROUTINES.md)
- [Backend API Spec](./BACKEND_API.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Integration Guide](./INTEGRATION.md)

## Code Examples

### Creating a New Workout Plan Card
```typescript
<WorkoutPlanCard
  workoutPlan={{
    id: '1',
    name: 'Upper Body Blast',
    description: 'Intense upper body workout',
    targetMuscleGroups: ['Chest', 'Back'],
    estimatedDuration: 45,
    difficulty: 'Intermediate',
    exerciseCount: 6,
  }}
  onPress={(plan) => console.log('Selected:', plan.id)}
/>
```

### Custom Save Handler
```typescript
const handleSaveRoutine = async () => {
  try {
    // Your custom save logic
    await api.post('/user/save-routine', { routineFolderId });
    console.log('Routine saved!');
  } catch (error) {
    console.error('Failed to save:', error);
  }
};

<SaveRoutineButton 
  routineFolderId={id} 
  onSave={handleSaveRoutine} 
/>
```

## API Service Reference

### RoutineFolderService
```typescript
// Get public routine folders
const folders = await RoutineFolderService.getPublicRoutineFolders();

// Get specific routine folder
const folder = await RoutineFolderService.getRoutineFolderById(id);
```

### WorkoutPlanService
```typescript
// Get workout plans by routine folder
const plans = await WorkoutPlanService.getWorkoutPlansByRoutineFolder(folderId);

// Get specific workout plan
const plan = await WorkoutPlanService.getWorkoutPlanById(id);
```

## Summary

The Routine Detail Screen is a comprehensive feature that:
- ✅ Displays full routine folder information
- ✅ Lists all associated workout plans
- ✅ Provides beautiful, intuitive UI
- ✅ Handles all loading and error states
- ✅ Includes save functionality (ready for API integration)
- ✅ Follows app's design system and conventions
- ✅ Prepared for future enhancements

All acceptance criteria have been met, and the feature is ready for backend integration and further development.

