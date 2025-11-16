# Public Routines Feature

## Overview
The Public Routines feature allows users to discover and explore pre-made workout programs created by the community. This screen provides a beautiful, grid-based layout for browsing available routine folders.

## Files Created/Modified

### New Files
1. **`app/public-routines.tsx`** - Main screen component
2. **`services/routineFolderService.ts`** - API service for routine folders
3. **`docs/PUBLIC_ROUTINES.md`** - This documentation

### Modified Files
1. **`types/api.ts`** - Added `RoutineFolder` interface
2. **`config/api.ts`** - Added routine folders endpoints
3. **`app/(tabs)/index.tsx`** - Added navigation button to public routines

## API Integration

### Endpoint
- **URL**: `GET /api/v1/routine-folders/public`
- **Base URL**: Via API Gateway `http://localhost:8080`
- **Authentication**: Not required (public endpoint)
- **Response**: Array of RoutineFolder objects

### Data Model

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

## Features Implemented

### ✅ Core Requirements
1. **Loading State** - Displays spinner with "Loading routines..." message
2. **Grid Display** - 2-column responsive grid showing routine cards with:
   - Name
   - Description (truncated to 2 lines)
   - Difficulty badge (color-coded: green for beginner, yellow for intermediate, red for advanced)
   - Duration chip with clock icon
   - Image or gradient placeholder
3. **Tappable Cards** - Each card is interactive and ready for navigation
4. **Empty State** - Shows friendly message when no public routines exist
5. **Error State** - Displays error message with retry button
6. **Pull-to-Refresh** - Implemented with native RefreshControl

### 🎨 UI/UX Details

#### Card Design
- **Layout**: 2-column grid with 16px gap
- **Style**: Rounded corners (16px), shadow effects
- **Image**: 120px height with fallback gradient
- **Tags**: Difficulty badge and duration chip
- **Colors**: Dynamically colored based on difficulty level

#### States
- **Loading**: Center-aligned spinner with loading text
- **Empty**: Icon with helpful message and pull-to-refresh
- **Error**: Alert icon, error message, and retry button
- **Success**: Grid of beautiful routine cards

#### Theme Integration
- Uses dark mode theme colors throughout
- Golden accent color for interactive elements
- Consistent with app's gaming aesthetic

## Usage

### Accessing the Screen
Users can access the Public Routines screen from the home screen:
1. Scroll to the "Discover" section
2. Tap "Public Workout Programs" card
3. Screen loads with all available public routines

### Service Usage

```typescript
import { RoutineFolderService } from '@/services/routineFolderService';

// Fetch all public routines
const response = await RoutineFolderService.getPublicRoutineFolders();

// Fetch specific routine by ID
const routine = await RoutineFolderService.getRoutineFolderById('some-id');
```

## Navigation

### Current Implementation
- Screen is accessible via: `router.push('/public-routines')`
- Back button returns to previous screen
- Card tap handler ready (logs to console currently)

### TODO: Detail Screen
To complete the feature, create a detail screen:
```typescript
// In handleRoutinePress function
router.push(`/routine-folder/${folder.id}`);
```

## API Configuration

The endpoint is configured in `config/api.ts`:

```typescript
ROUTINE_FOLDERS: {
  PUBLIC: '/api/v1/routine-folders/public',
  GET_BY_ID: (id: string) => `/api/v1/routine-folders/${id}`,
}
```

## Testing

### Manual Testing Steps
1. **Loading State**: Launch screen, verify spinner appears
2. **Empty State**: Test with empty response, verify message shows
3. **Error State**: Test with network error, verify retry button works
4. **Success State**: Test with data, verify cards display correctly
5. **Pull-to-Refresh**: Pull down to refresh, verify loading indicator
6. **Navigation**: Tap back button, verify returns to home
7. **Card Interaction**: Tap cards, verify haptic feedback

### Backend Requirements
Ensure your backend API returns data in this format:

```json
{
  "success": true,
  "message": "Public routine folders retrieved successfully",
  "data": [
    {
      "id": "uuid-here",
      "name": "Beginner Full Body",
      "description": "Perfect for newcomers to strength training",
      "difficulty": "Beginner",
      "duration": "4 weeks",
      "imageUrl": "https://example.com/image.jpg",
      "isPublic": true,
      "createdBy": "username"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Performance Considerations

- **Image Loading**: Images are loaded asynchronously with fallback
- **Retry Logic**: Built-in exponential backoff retry (3 attempts)
- **Refresh**: Pull-to-refresh doesn't show loading state again
- **Error Recovery**: Users can retry failed requests easily

## Accessibility

- All interactive elements have proper touch targets (minimum 44x44)
- Loading states provide clear feedback
- Error messages are descriptive and actionable
- Colors have sufficient contrast for readability

## Future Enhancements

1. **Search/Filter**: Add search bar and category filters
2. **Sorting**: Sort by difficulty, duration, or popularity
3. **Detail Screen**: Create detailed view for each routine folder
4. **Favorites**: Allow users to bookmark favorite routines
5. **Preview**: Show preview of exercises in each routine
6. **Stats**: Display number of users following each routine
7. **Ratings**: Show user ratings and reviews

## Troubleshooting

### Issue: Cards not displaying
- Check API response format matches expected structure
- Verify `isPublic` field is true for folders
- Check console logs for API errors

### Issue: Images not loading
- Verify `imageUrl` is valid and accessible
- Check CORS settings on image server
- Fallback gradient should still display

### Issue: Pull-to-refresh not working
- Ensure ScrollView has contentContainerStyle
- Verify RefreshControl is properly attached
- Check haptic feedback is not blocking

## Related Documentation
- [Backend API Spec](./BACKEND_API.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Integration Guide](./INTEGRATION.md)

