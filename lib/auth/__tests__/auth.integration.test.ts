import { describe, it, expect } from '@jest/globals';
import { generateToken, verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt';
import { hashPassword, comparePassword } from '@/lib/auth/password';
import { hasPermission } from '@/lib/auth/types';

describe('Authentication & Authorization', () => {
  describe('JWT', () => {
    it('should generate and verify valid tokens', () => {
      const session = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'ADMIN' as const,
        status: 'APPROVED' as const,
      };

      const token = generateToken(session);
      expect(token).toBeTruthy();

      const decoded = verifyToken(token);
      expect(decoded?.userId).toBe('user-123');
      expect(decoded?.email).toBe('test@example.com');
    });

    it('should extract token from Authorization header', () => {
      const token = 'test-token-123';
      const header = `Bearer ${token}`;
      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('should return null for invalid header', () => {
      expect(extractTokenFromHeader('Invalid format')).toBeNull();
      expect(extractTokenFromHeader()).toBeNull();
    });
  });

  describe('Password Hashing', () => {
    it('should hash and verify passwords', async () => {
      const password = 'secure-password-123';
      const hashed = await hashPassword(password);
      const isValid = await comparePassword(password, hashed);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'secure-password-123';
      const hashed = await hashPassword(password);
      const isValid = await comparePassword('wrong-password', hashed);
      expect(isValid).toBe(false);
    });
  });

  describe('RBAC', () => {
    it('should check voter permissions', () => {
      expect(hasPermission('VOTER', 'view:elections')).toBe(true);
      expect(hasPermission('VOTER', 'cast:vote')).toBe(true);
      expect(hasPermission('VOTER', 'create:election')).toBe(false);
    });

    it('should check admin permissions', () => {
      expect(hasPermission('ADMIN', 'view:elections')).toBe(true);
      expect(hasPermission('ADMIN', 'create:election')).toBe(true);
      expect(hasPermission('ADMIN', 'delete:election')).toBe(true);
    });

    it('should check observer permissions', () => {
      expect(hasPermission('OBSERVER', 'view:election')).toBe(true);
      expect(hasPermission('OBSERVER', 'view:auditlog')).toBe(true);
      expect(hasPermission('OBSERVER', 'cast:vote')).toBe(false);
    });
  });
});
