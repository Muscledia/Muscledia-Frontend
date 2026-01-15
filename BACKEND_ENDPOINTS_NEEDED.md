# Missing Backend Endpoints

Your Spring Boot backend is missing several GET endpoints that the frontend needs. Here's what needs to be implemented:

## ❌ Missing Endpoints (Returning 404/405 Errors)

### 1. Get Single Routine Folder by ID
```
GET /api/v1/routine-folders/{id}
```
**Response:**
```json
{
  "success": true,
  "message": "Routine folder retrieved successfully",
  "data": {
    "id": "688ee1df56542e13c2312b00",
    "title": "Advanced Full-Body (Equipment-Free)",
    "description": "...",
    "workoutPlanIds": ["uuid1", "uuid2", "uuid3"],
    "difficultyLevel": "ADVANCED",
    "equipmentType": "EQUIPMENT_FREE",
    "workoutSplit": "FULL_BODY",
    "isPublic": true,
    "createdBy": 1,
    "workoutPlanCount": 3,
    ...
  },
  "timestamp": "2025-11-22T..."
}
```

### 2. Get Single Workout Plan by ID
```
GET /api/v1/workout-plans/{id}
```
**Response:**
```json
{
  "success": true,
  "message": "Workout plan retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Workout Day 1",
    "description": "...",
    "targetMuscleGroups": ["chest", "triceps"],
    "estimatedDuration": 60,
    "difficulty": "advanced",
    "exerciseCount": 8
  },
  "timestamp": "2025-11-22T..."
}
```

### 3. Check if Routine is Saved
```
GET /api/v1/routine-folders/is-saved/{id}
```
**Response:**
```json
{
  "success": true,
  "message": "Save status retrieved",
  "data": {
    "isSaved": false
  },
  "timestamp": "2025-11-22T..."
}
```

### 4. Get Workout Plan Details (with exercises)
```
GET /api/v1/workout-plans/{id}/details
```
OR include exercises in the workout plan response above.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Workout Day 1",
    "exercises": [
      {
        "id": "exercise-uuid",
        "name": "Bench Press",
        "sets": 4,
        "reps": 10,
        "muscleGroups": ["chest"],
        ...
      }
    ]
  }
}
```

## ✅ Working Endpoints

### 1. Get All Public Routine Folders
```
GET /api/v1/routine-folders/public
```
✅ This works correctly!

### 2. Save Public Routine (probably)
```
POST /api/v1/routine-folders/save/{id}
```
(Untested but likely exists based on the service code)

## Implementation Priority

1. **High Priority**: `GET /api/v1/workout-plans/{id}` - needed to display workout plans
2. **High Priority**: `GET /api/v1/routine-folders/{id}` - needed for direct navigation
3. **Medium Priority**: `GET /api/v1/routine-folders/is-saved/{id}` - for save button state
4. **Medium Priority**: `GET /api/v1/workout-plans/{id}/details` - for workout plan details page

## Spring Boot Implementation Example

```java
@RestController
@RequestMapping("/api/v1/routine-folders")
public class RoutineFolderController {
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoutineFolder>> getRoutineFolderById(@PathVariable String id) {
        // Your implementation
        RoutineFolder folder = routineFolderService.findById(id);
        return ResponseEntity.ok(ApiResponse.success("Routine folder retrieved", folder));
    }
    
    @GetMapping("/is-saved/{id}")
    public ResponseEntity<ApiResponse<SaveStatusDTO>> isRoutineSaved(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Your implementation
        boolean isSaved = routineFolderService.isRoutineSavedByUser(id, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Status retrieved", 
            new SaveStatusDTO(isSaved)));
    }
}

@RestController
@RequestMapping("/api/v1/workout-plans")
public class WorkoutPlanController {
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkoutPlan>> getWorkoutPlanById(@PathVariable String id) {
        // Your implementation
        WorkoutPlan plan = workoutPlanService.findById(id);
        return ResponseEntity.ok(ApiResponse.success("Workout plan retrieved", plan));
    }
}
```

## Temporary Workaround

The frontend has been updated to:
1. Pass routine data through navigation (avoids needing GET /routine-folders/{id})
2. Gracefully handle missing workout plans (shows empty list instead of crashing)
3. Hide save button errors (logs warnings instead of showing error UI)

However, **you still need to implement these endpoints** for the app to work fully!

