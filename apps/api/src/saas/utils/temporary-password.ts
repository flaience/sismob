import { randomBytes } from 'node:crypto';

export function generateTemporaryPassword(): string {
  const randomPart = randomBytes(10)
    .toString('base64url')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 12);

  return `Sm!${randomPart}9`;
}
