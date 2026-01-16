// types/auth.types.ts
// Authentication-related types

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  email?: string;
  uuidString: string;
  roles: string[];
  message?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  birthDate?: string;
  gender?: string;
  height?: number;
  initialWeight?: number;
  goalType?: string;
}

export interface RegisterResponse {
  userId: string;
  uuidString: string;
  username: string;
  email: string;
  birthDate: string;
  gender: string;
  height: number;
  initialWeight: number;
  goalType: string;
  userChampions: any[];
  userBadges: any[];
  roles: any[];
  currentStreak: number;
  totalExp: number;
  createdAt: string;
  updatedAt: string;
  admin: boolean;
}
