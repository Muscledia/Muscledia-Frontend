export { AuthService } from './authService';
export { UserService } from './userService';
// export { WorkoutService } from './workoutService';    //uncomment in the future after implementing logic of those services
// export { GamificationService } from './gamificationService';
export { 
  apiRequest, 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  getApiClient, 
  initializeApiClient,
  setAuthToken,
  clearAuthToken
} from './api';