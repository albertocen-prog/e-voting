# Database Schema & Migrations (T3)

## Overview

T3 implements the complete database schema for the e-elct voting platform using Prisma ORM with PostgreSQL.

## Key Features

✅ Full relational data model  
✅ Automatic migrations with Prisma  
✅ Foreign key constraints & cascading deletes  
✅ Indexes for performance optimization  
✅ Audit trail (append-only logs)  
✅ Unique constraints to prevent duplicate votes  
✅ Enum types for roles and statuses  

## Database Schema

### Core Tables

#### `users`
Stores all user accounts (voters, officials, observers, admins).

```typescript
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String?  // null for voter-only ID auth
  name          String
  role          Role     @default(VOTER)
  status        UserStatus @default(PENDING)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
