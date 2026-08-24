// TypeScript types for the application
import { UserRole, ElectionStatus, BallotType, UserStatus } from '@prisma/client'

// User types
export interface UserData {
  id: string
  email?: string
  name: string
  role: UserRole
  status: UserStatus
  created_at: Date
  updated_at: Date
}

export interface VoterRegistrationData {
  id: string
  user_id?: string
  voter_id: string
  verification_info?: string
  approved_by?: string
  approved_at?: Date
  created_at: Date
  updated_at: Date
}

// Election types
export interface ElectionData {
  id: string
  title: string
  description?: string
  start_at: Date
  end_at: Date
  status: ElectionStatus
  created_by: string
  created_at: Date
  updated_at: Date
}

// Ballot and Option types
export interface BallotData {
  id: string
  election_id: string
  title: string
  type: BallotType
  created_at: Date
  updated_at: Date
}

export interface OptionData {
  id: string
  ballot_id: string
  label: string
  metadata?: any
  created_at: Date
}

// Vote type
export interface VoteData {
  id: string
  election_id: string
  ballot_id: string
  option_id: string
  voter_id: string
  user_id?: string
  created_at: Date
}

// Audit log type
export interface AuditLogData {
  id: string
  actor_id?: string
  actor_role?: UserRole
  action: string
  target_type?: string
  target_id?: string
  details?: any
  created_at: Date
}

// API Response types
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: string
  message?: string
  errors?: Record<string, string>
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse
  
