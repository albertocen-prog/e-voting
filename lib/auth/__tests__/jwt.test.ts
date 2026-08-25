import { generateToken, verifyToken, extractTokenFromHeader } from '../jwt';
import { AuthSession } from '../types';

describe('JWT Auth', () => {
  const mockSession: AuthSession = {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'ADMIN',
    status: 'APPROVED',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockSession);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = generateToken(mockSession);
      const decoded = verifyToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe(mockSession.userId);
      expect(decoded?.email).toBe(mockSession.email);
      expect(decoded?.role).toBe(mockSession.role);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid.token.here');
      expect(decoded).toBeNull();
    });

    it('should return null for empty token', () => {
      const decoded = verifyToken('');
      expect(decoded).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const header = `Bearer ${token}`;
      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('should return null for missing header', () => {
      const extracted = extractTokenFromHeader();
      expect(extracted).toBeNull();
    });

    it('should return null for invalid format', () => {
      const extracted = extractTokenFromHeader('InvalidHeader token');
      expect(extracted).toBeNull();
    });
  });
});
