# Authentication System (T2)

## Overview

The authentication system implements:
- **Voter ID-based login** for voters (simple, ID-only)
- **Email + password login** for officials, observers, and admins
- **JWT tokens** for session management
- **Role-Based Access Control (RBAC)** middleware
- **Password hashing** with bcryptjs
- **Audit logging** for all auth events

## Architecture

### Core Components

#### `lib/auth/types.ts`
Defines TypeScript interfaces and role-based permissions:
- `AuthSession` - Session data structure
- `DecodedToken` - JWT payload structure
- `ROLE_PERMISSIONS` - Permission matrix for each role

#### `lib/auth/jwt.ts`
JWT token generation and verification:
- `generateToken(session)` - Creates a signed JWT
- `verifyToken(token)` - Validates and decodes JWT
- `extractTokenFromHeader(authHeader)` - Parses Authorization header

#### `lib/auth/password.ts`
Password security utilities:
- `hashPassword(password)` - Hash with bcryptjs (10 rounds)
- `comparePassword(plain, hashed)` - Constant-time comparison

#### `lib/auth/middleware.ts`
Next.js API middleware for protection:
- `authMiddleware` - Verify JWT token is present and valid
- `requireRole(...roles)` - Check user has one of specified roles
- `requireApprovedVoter` - Voter-specific checks (approved status)

### API Endpoints

#### `POST /api/auth/voter-login`
Voter ID-based login.

**Request:**
```json
{
  "voterId": "V12345"
}
