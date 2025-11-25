# Error Analysis: Workout Plans Fetch Failure

## 1. The Error
The application is encountering `404 Not Found` errors when attempting to fetch workout plans for a specific routine folder.

**Log Excerpt:**
```
LOG  Request: GET /api/v1/routine-folders/688ee1df56542e13c2312aff/workout-plans
LOG  Nested endpoint not found, trying alternative...
LOG  Request: GET /api/v1/workout-plans?routineFolderId=688ee1df56542e13c2312aff
WARN  Both workout plan endpoints failed, returning empty array
```

## 2. Technical Analysis

### Frontend Logic
The error originates in `services/routineService.ts` (and similarly in `services/workoutPlanService.ts`). The frontend implements a fallback strategy:

1.  **Primary Attempt**: Tries to fetch from a nested endpoint:
    `GET /api/v1/routine-folders/{routineFolderId}/workout-plans`
2.  **Fallback Attempt**: If the primary fails (404/405), it tries a query parameter endpoint:
    `GET /api/v1/workout-plans?routineFolderId={routineFolderId}`

Both attempts are failing with `404 Not Found`.

### Individual Workout Plan Fetch Failure
The logs also show failures when fetching specific workout plans by ID:
`GET /api/v1/workout-plans/146d96dd-cb54-40fa-b89f-e2b16ddcd269` -> 404
This indicates that the basic `GET /api/v1/workout-plans/{id}` endpoint is also missing or the IDs are invalid.

### Backend Status
The backend does not expose these endpoints. This confirms the "Missing Backend Endpoints" status noted in project documentation.

### The "405 Method Not Allowed" Error
The logs also show an intermittent `405` error for `GET /api/v1/routine-folders/personal`:
```
ERROR  API Request failed: [AxiosError: Request failed with status code 405]
```
However, a subsequent request to the same endpoint returned `200 OK` with data.
*   **Cause**: A 405 error on a GET request usually means the server recognizes the URL but doesn't allow GET requests (perhaps only POST/PUT). The fact that it later worked suggests the backend might have been restarting, inconsistent, or there is a specific condition triggering the 405.

## 3. Proposed Solutions

### Option A: Implement Nested Endpoint (Recommended)
Update the backend to support the RESTful nested structure. This is the cleanest approach.

**Endpoint:** `GET /api/v1/routine-folders/{id}/workout-plans`
**Implementation:**
```java
@GetMapping("/{id}/workout-plans")
public ResponseEntity<List<WorkoutPlan>> getWorkoutPlansByFolder(@PathVariable String id) {
    return ResponseEntity.ok(workoutPlanService.findByFolderId(id));
}
```

### Option B: Implement Query Parameter
Alternatively, update the backend to filter workout plans by the query parameter.

**Endpoint:** `GET /api/v1/workout-plans?routineFolderId={id}`

### Option C: Frontend Adjustment (Temporary Fix)
If the backend has a different way of linking plans (e.g., passing a list of IDs to a bulk fetch endpoint), update `RoutineService.getWorkoutPlansByRoutineFolderId` to matches that behavior.
*   *Current State*: The frontend *does* have logic to fetch by IDs (`getWorkoutPlansByIds`), but it relies on first getting the folder details which contains the list of IDs. If fetching the folder *also* fails (which happens in some flows), the chain breaks.

## 4. Immediate Action Items
1.  **Backend Team**: Implement `GET /api/v1/routine-folders/{id}/workout-plans`.
2.  **Frontend Team**: No immediate code change needed *if* the backend implements the above. The frontend logic is already robust enough to handle the 404 gracefully (it returns an empty array), but the UI will show no plans until the backend is fixed.

