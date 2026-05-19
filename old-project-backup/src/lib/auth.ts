import { db } from './db';

const encoder = new TextEncoder();

export async function hashPassword(password: string): Promise<string> {
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function createAdmin(username: string, password: string) {
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  return db.admin.add({
    username: username.trim(),
    passwordHash,
    createdAt: now,
    updatedAt: now,
    id: 0
  });
}

export async function verifyAdmin(username: string, password: string) {
  const admin = await db.admin.where('username').equals(username.trim()).first();
  if (!admin) return null;
  const hash = await hashPassword(password);
  return hash === admin.passwordHash ? admin : null;
}

export async function changeAdminPassword(adminId: number, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  const updatedAt = new Date().toISOString();
  await db.admin.update(adminId, { passwordHash, updatedAt });
}
