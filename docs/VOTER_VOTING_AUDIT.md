# Voter Registration, Voting, & Audit (T5-T7)

## Overview

T5-T7 implement the complete voter lifecycle: registration → approval → voting, plus audit logging and receipts.

## T5: Voter Registration & Approval

### API Endpoints

#### `POST /api/voters/register`
Register a new voter (public endpoint, no auth required).

**Request:**
```json
{
  "voterId": "V12345",
  "verificationInfo": "Student ID verified"
}
