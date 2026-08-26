// Audit logging utilities

import { prisma } from '@/lib/db';
import { UserRole } from '@/lib/auth/types';

export interface AuditLogEntry {
  actorId: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, any>;
}

/**
 * Log an action to the audit trail (append-only)
 */
export const createAuditLog = async (entry: AuditLogEntry) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        actorRole: entry.actorRole,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        details: entry.details ? JSON.stringify(entry.details) : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - logging failures shouldn't break the main operation
  }
};

/**
 * Get audit logs with filtering and pagination
 */
export const getAuditLogs = async (filters: {
  electionId?: string;
  actorId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
}) => {
  const { electionId, actorId, action, startDate, endDate, skip = 0, take = 50 } = filters;

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      ...(electionId && { targetId: electionId }),
      ...(actorId && { actorId }),
      ...(action && { action }),
      ...(startDate && { createdAt: { gte: startDate } }),
      ...(endDate && { createdAt: { lte: endDate } }),
    },
    include: {
      actor: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });

  const total = await prisma.auditLog.count({
    where: {
      ...(electionId && { targetId: electionId }),
      ...(actorId && { actorId }),
      ...(action && { action }),
      ...(startDate && { createdAt: { gte: startDate } }),
      ...(endDate && { createdAt: { lte: endDate } }),
    },
  });

  return {
    logs: auditLogs,
    total,
    skip,
    take,
    hasMore: skip + take < total,
  };
};
