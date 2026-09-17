// Voter registration utilities

import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';

export interface VoterRegistrationRequest {
  voterId: string;
  password: string;
  verificationMode?: string;
}

export interface VoterRegistrationWithUser {
  id: string;
  userId: string;
  voterId: string;
  verificationMode?: string;
  approvedAt?: Date;
  createdAt: Date;
  user: {
    id: string;
    email?: string;
    name: string;
    status: string;
  };
}

/**
 * Register a new voter
 */
export const registerVoter = async ({
  voterId,
  password,
  verificationMode
}: VoterRegistrationRequest) => {
  // Check if voter ID already exists
  const existing = await prisma.voterRegistration.findUnique({
    where: { voterId },
  });

  if (existing) {
    throw new Error('Voter ID already registered');
  }

  // Hash the plain-text password before saving
  const hashedPassword = await hashPassword(password);

  // Create user account (status: PENDING)
  const user = await prisma.user.create({
    data: {
      email: `voter-${voterId}@e-elct.local`,
      name: voterId,
      passwordHash: hashedPassword,
      role: 'VOTER',
      status: 'PENDING',
    },
  });

  // Create voter registration tied to the created user
  const registration = await prisma.voterRegistration.create({
    data: {
      voterId,
      userId: user.id,
      verificationMode: verificationMode,
    },
    include: { user: true },
  });

  return { success: true, user, registration };
};

/**
 * Approve a voter registration
 */
export const approveVoter = async (voterId: string, approvedBy: string) => {
  const registration = await prisma.voterRegistration.findUnique({
    where: { voterId },
    include: { user: true },
  });

  if (!registration || !registration.userId) {
    throw new Error('Voter registration not found');
  }

  // Update user status to APPROVED
  const updated = await prisma.user.update({
    where: { id: registration.userId },
    data: { status: 'APPROVED' },
  });

  // Update registration with approval details
  // Note: Adjust 'approvedById' to match your schema field name if it differs from 'approvedBy'
  await prisma.voterRegistration.update({
    where: { voterId },
    data: {
      approvedBy,
      approvedAt: new Date(),
    },
  });

  return updated;
};

/**
 * Reject a voter registration
 */
export const rejectVoter = async (voterId: string) => {
  const registration = await prisma.voterRegistration.findUnique({
    where: { voterId },
    include: { user: true },
  });

  if (!registration || !registration.userId) {
    throw new Error('Voter registration not found');
  }

  // Update user status to REJECTED
  const updated = await prisma.user.update({
    where: { id: registration.userId },
    data: { status: 'REJECTED' },
  });

  return updated;
};

/**
 * Get pending voter registrations
 */
export const getPendingVoters = async (skip = 0, take = 20) => {
  const registrations = await prisma.voterRegistration.findMany({
    where: {
      user: {
        status: 'PENDING',
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    skip,
    take,
  });

  const total = await prisma.voterRegistration.count({
    where: {
      user: {
        status: 'PENDING',
      },
    },
  });

  return {
    voters: registrations,
    total,
    skip,
    take,
    hasMore: skip + take < total,
  };
};
