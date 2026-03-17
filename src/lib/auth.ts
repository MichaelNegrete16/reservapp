const SESSION_COOKIE = "reservapp-session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export function setSession(role: "user" | "admin") {
  document.cookie = `${SESSION_COOKIE}=${role}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearSession() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

// Credenciales mock
export const MOCK_USERS = [
  { email: "demo@reservapp.com", password: "demo123", role: "user" as const },
  { email: "admin@reservapp.com", password: "admin123", role: "admin" as const },
];
