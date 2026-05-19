const SESSION_KEY = 'shoeshop-admin-session';

export function saveSession(adminId: number) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ adminId, createdAt: new Date().toISOString() }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw) as { adminId: number; createdAt: string };
    return payload;
  } catch {
    clearSession();
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getSession());
}
