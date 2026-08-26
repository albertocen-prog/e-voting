# Election CRUD APIs (T4)

## Overview

T4 implements the complete Election management API with full CRUD operations, election lifecycle (DRAFT → OPEN → CLOSED), and results aggregation.

## Architecture

### API Endpoints

#### Elections Management

##### `GET /api/elections`
List all elections with pagination and filtering.

**Query Parameters:**
- `skip` - Pagination offset (default: 0)
- `take` - Items per page (default: 10, max: 100)
- `status` - Filter by status (DRAFT, OPEN, CLOSED, ARCHIVED)

**Response (200):**
```json
{
  "elections": [
    {
      "id": "elc-123",
      "title": "Student Body President 2024",
      "description": "Vote for next year's president",
      "status": "OPEN",
      "startAt": "2024-01-20T10:00:00Z",
      "endAt": "2024-01-21T10:00:00Z",
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "skip": 0,
    "take": 10,
    "hasMore": false
  }
}
