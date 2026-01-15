// types/api.ts
// Base API types and common response structures

// API Error Type
export interface ApiError {
  success: boolean;
  error: string;
  message: string;
  path: string;
  status: number;
  timestamp: string;
  details?: any;
}

// Error Response Type
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  status: number;
  timestamp: string;
}

// Base API Response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
  status?: number;
}

// User Types
export interface User {
  id: number;
  email: string;
  username: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}
