import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcryptjs
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcryptjs.genSalt(SALT_ROUNDS);
  return bcryptjs.hash(password, salt);
};

/**
 * Compare a plain password with a hashed password
 */
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcryptjs.compare(plainPassword, hashedPassword);
};
