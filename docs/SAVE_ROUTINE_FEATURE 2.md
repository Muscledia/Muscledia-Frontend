# Save Public Routine to Personal Collection Feature

## Overview

This feature allows authenticated users to save public routine folders (with all their workout plans) to their personal collection. It includes comprehensive error handling, authentication checks, and a smooth user experience.

## Architecture

### Components

1. **SaveRoutineButton** (`components/routines/SaveRoutineButton.tsx`)
   - Smart button component that adapts to authentication and save state
   - Shows different states: Login Required, Checking, Saving, Saved
   - Provides haptic feedback

2. **useRoutineSave Hook** (`hooks/useRoutineSave.ts`)
   - Manages save routine state and logic
   - Handles authentication checks
   - Manages API calls and error handling
   - Automatically checks if routine is already saved on mount

3. **RoutineService** (`services/routineService.ts`)
   - API service methods for routine operations
   - `savePublicRoutine()` - Save a public routine
   - `isRoutineSaved()` - Check if routine is already saved

### API Endpoints

```typescript
// Save public routine
POST /api/v1/routine-folders/save/{publicId}
Headers: Authorization: Bearer {token}
Response: {
  routineFolder: RoutineFolder,
  workoutPlans: WorkoutPlan[],
  message: string
}

// Check save status
GET /api/v1/routine-folders/is-saved/{publicId}
Headers: Authorization: Bearer {token}
Response: { isSaved: boolean }
```

## User Flow

### 1. Unauthenticated User

```
User taps button → Button shows "Login to Save" with lock icon
User taps → Alert prompts: "Login Required"
User can choose: Cancel | Login
If Login → Navigate to login screen
```

### 2. Authenticated User (First Save)

```
User taps button → Confirmation dialog: "Add to collection?"
User confirms → API call starts
Button shows: "Saving..." with spinner
Success → Alert: "Success! Saved to your routines"
Button changes to: "Saved to My Routines" with checkmark (green)
User can: OK | View My Routines
```

### 3. Authenticated User (Already Saved)

```
On screen load → Hook checks save status automatically
Button shows: "Saved to My Routines" with checkmark (disabled)
If user tries to save again → 409 error caught
Alert: "Already Saved" with option to view routines
```

## Error Handling

### 401 Unauthorized (Session Expired)

```typescript
Alert.alert(
  'Session Expired',
  'Your session has expired. Please log in again.',
  [
    { text: 'Cancel' },
    { text: 'Login', onPress: () => router.push('/(auth)/login') }
  ]
);
```

**User Experience:**
- Token expired or invalid
- Prompt to re-login
- Redirect to login screen
- After login, user can return and save

### 409 Conflict (Already Saved)

```typescript
Alert.alert(
  'Already Saved',
  '"Routine Name" is already in your collection.',
  [
    { text: 'OK' },
    { text: 'View My Routines', onPress: () => router.push('/(tabs)') }
  ]
);
```

**User Experience:**
- Routine already exists in user's collection
- Button automatically changes to "Saved" state
- User can navigate to their routines
- Prevents duplicate saves

### 404 Not Found (Routine Unavailable)

```typescript
Alert.alert(
  'Routine Unavailable',
  'This routine is no longer available.',
  [{ text: 'OK' }]
);
```

**User Experience:**
- Public routine was deleted
- Clear error message
- User can go back
- Button remains in error state

### Network Error

```typescript
Alert.alert(
  'Connection Error',
  'Unable to connect to the server. Please check your internet connection.',
  [
    { text: 'Cancel' },
    { text: 'Retry', onPress: () => saveRoutine() }
  ]
);
```

**User Experience:**
- No internet connection
- Server unreachable
- Option to retry immediately
- Helpful error message

### Generic API Error

```typescript
Alert.alert(
  'Error',
  'Failed to save routine. Please try again.',
  [
    { text: 'Cancel' },
    { text: 'Retry', onPress: () => saveRoutine() }
  ]
);
```

**User Experience:**
- Unknown server error
- Option to retry
- Error message from API displayed

## Button States

### 1. Not Authenticated
- **Icon:** Lock
- **Text:** "Login to Save"
- **Color:** Gray/Muted
- **Enabled:** Yes (prompts login)

### 2. Checking Status
- **Icon:** Spinner
- **Text:** "Checking..."
- **Color:** Golden gradient
- **Enabled:** No

### 3. Ready to Save
- **Icon:** Download
- **Text:** "Save to My Routines"
- **Color:** Golden gradient
- **Enabled:** Yes

### 4. Saving
- **Icon:** Spinner
- **Text:** "Saving..."
- **Color:** Golden gradient
- **Enabled:** No

### 5. Saved
- **Icon:** Checkmark
- **Text:** "Saved to My Routines"
- **Color:** Green gradient
- **Enabled:** No (disabled)

## Implementation Details

### Auto-Check Save Status

When the screen loads and user is authenticated:

```typescript
useEffect(() => {
  if (isAuthenticated && routineId) {
    checkSaveStatus();
  }
}, [routineId, isAuthenticated]);
```

This automatically checks if the routine is already saved and updates the button state accordingly.

### Confirmation Dialog

Before saving, user must confirm:

```typescript
Alert.alert(
  'Save Routine',
  `Add "${routineName}" to your personal collection?`,
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Save', onPress: async () => await performSave() }
  ]
);
```

### Success Feedback

Multiple levels of feedback:
1. **Haptic:** Medium impact on button press
2. **Visual:** Button changes to green with checkmark
3. **Alert:** Success message with navigation option
4. **Navigation:** Option to view saved routines immediately

## Integration Points

### In Routine Detail Screen

```typescript
import SaveRoutineButton from '@/components/routines/SaveRoutineButton';

<SaveRoutineButton
  routineId={routine.id}
  routineName={routine.name}
/>
```

The button is fully self-contained and handles all logic internally.

### Custom Save Handler (Optional)

If you need custom behavior:

```typescript
<SaveRoutineButton
  routineId={routine.id}
  routineName={routine.name}
  onSave={async (id) => {
    // Custom save logic
    await myCustomSaveFunction(id);
  }}
/>
```

## Testing Scenarios

### Manual Testing Checklist

- [ ] Unauthenticated user sees "Login to Save"
- [ ] Login prompt appears when tapped unauthenticated
- [ ] Authenticated user sees "Save to My Routines"
- [ ] Confirmation dialog appears before save
- [ ] Spinner shows during save operation
- [ ] Success message displays after save
- [ ] Button changes to green "Saved" state
- [ ] "View My Routines" navigation works
- [ ] Already saved routines show green state on load
- [ ] Duplicate save attempts show "Already Saved" message
- [ ] 401 error prompts re-login
- [ ] 404 error shows "Unavailable" message
- [ ] Network errors show retry option
- [ ] Retry button successfully retries save
- [ ] Haptic feedback works on interactions

### Error Simulation

To test error handling:

```typescript
// In routineService.ts, temporarily modify:

// Test 401
throw { status: 401, message: 'Unauthorized' };

// Test 409
throw { status: 409, message: 'Routine already saved' };

// Test 404
throw { status: 404, message: 'Not found' };

// Test network error
throw { message: 'Network request failed' };
```

## Future Enhancements

1. **Offline Support**
   - Queue save requests when offline
   - Sync when connection restored

2. **Unsave Functionality**
   - Allow users to remove saved routines
   - Button changes back to "Save" state

3. **Toast Notifications**
   - Replace alerts with toast notifications
   - Less intrusive for success messages

4. **Progress Tracking**
   - Show progress if copying large routines
   - Display number of workout plans being copied

5. **Analytics**
   - Track save success rate
   - Monitor error frequencies
   - Identify popular routines

## Security Considerations

- JWT token automatically included in requests
- Token refresh handled by API interceptor
- No sensitive data stored locally
- All API calls go through authenticated endpoints
- CSRF protection via Bearer token

## Performance

- **Auto-check:** Runs once on mount, minimal impact
- **Save operation:** Single API call
- **State management:** Efficient React hooks
- **No polling:** Uses direct API calls only
- **Optimistic UI:** Button state updates immediately after API confirmation

