import { prisma } from '@/lib/db';

/**
 * Log an action to the audit trail (append-only)
 */
export const createAuditLog = async (entry) => {
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
export const getAuditLogs = async (filters = {}) => {
  const { electionId, actorId, action, startDate, endDate, skip = 0, take = 50 } = filters;

  const where = {
    ...(electionId && { targetId: electionId }),
    ...(actorId && { actorId }),
    ...(action && { action }),
    ...(startDate && { createdAt: { gte: startDate } }),
    ...(endDate && { createdAt: { lte: endDate } }),
  };

  const auditLogs = await prisma.auditLog.findMany({
    where,
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

  const total = await prisma.auditLog.count({ where });

  return {
    logs: auditLogs,
    total,
    skip,
    take,
    hasMore: skip + take < total,
  };
};
