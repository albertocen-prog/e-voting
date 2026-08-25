// Authentication types and interfaces

export interface AuthSession {
  userId: string;
  voterId?: string;
  email?: string;
  role: 'VOTER' | 'ELECTION_OFFICIAL' | 'OBSERVER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  iat?: number;
  exp?: number;
}

export interface VoterLoginRequest {
  voterId: string;
}

export interface EmailLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email?: string;
    name?: string;
    role: string;
    status: string;
  };
}

export interface DecodedToken {
  userId: string;
  voterId?: string;
  email?: string;
  role: string;
  status: string;
  iat: number;
  exp: number;
}

export type UserRole = 'VOTER' | 'ELECTION_OFFICIAL' | 'OBSERVER' | 'ADMIN';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

// Role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  VOTER: ['view:elections', 'cast:vote', 'view:receipt'],
  ELECTION_OFFICIAL: [
    'create:election',
    'edit:election',
    'open:election',
    'close:election',
    'view:results',
    'view:voterlist',
  ],
  OBSERVER: ['view:election', 'view:results', 'view:auditlog'],
  ADMIN: ['*'],
};

export const hasPermission = (role: UserRole, permission: string): boolean => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes('*') || permissions.includes(permission);
};
