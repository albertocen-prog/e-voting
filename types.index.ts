import { Role } from '@prisma/client';

export interface AuthSession {
  userId: string;
  role: Role;
  email: string;
  voterId?: string;
  expiresAt: number;
}

export interface VoterSession extends AuthSession {
  role: typeof Role.VOTER;
  voterId: string;
}

export interface StaffSession extends AuthSession {
  role: typeof Role.OFFICIAL | typeof Role.OBSERVER | typeof Role.ADMIN;
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  message: string;
  error?: string;
}
