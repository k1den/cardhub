import { hash, verify } from '@node-rs/argon2';

/**
 * Argon2id password hashing parameters according to OWASP guidelines:
 * - memoryCost: 64MB (65536 KiB)
 * - timeCost: 3 iterations
 * - parallelism: 4 threads
 */
const ARGON2_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  outputLen: 32,
  parallelism: 4,
};

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}
