import { hashPassword, comparePassword } from '../password';

describe('Password Auth', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'test-password-123';
      const hashed = await hashPassword(password);

      expect(hashed).toBeTruthy();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'test-password-123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'test-password-123';
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword(password, hashed);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'test-password-123';
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword('wrong-password', hashed);

      expect(isMatch).toBe(false);
    });
  });
});
