import { api, setToken, setRefreshToken, clearTokens } from './api-client';

const SESSION_COOKIE = 'reservapp-session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'superadmin';
  restaurantId: string;
  restaurant?: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    logoUrl?: string;
  };
}

export interface PlanInfo {
  plan: string;
  features: string[];
  limits: {
    maxZones: number;
    maxTables: number;
    maxMenuItems: number;
    maxReservationsPerMonth: number;
    maxTeamMembers: number;
  };
}

function setSessionCookie(role: string) {
  document.cookie = `${SESSION_COOKIE}=${role}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  restaurantName: string;
  restaurantAddress?: string;
}): Promise<AuthUser> {
  const res = await api.post<{ ok: boolean; data: { user: AuthUser; accessToken: string; refreshToken: string } }>('/auth/register', data);
  setToken(res.data.accessToken);
  setRefreshToken(res.data.refreshToken);
  setSessionCookie(res.data.user.role === 'superadmin' ? 'admin' : 'user');
  return res.data.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await api.post<{ ok: boolean; data: { user: AuthUser; accessToken: string; refreshToken: string } }>('/auth/login', { email, password });
  setToken(res.data.accessToken);
  setRefreshToken(res.data.refreshToken);
  setSessionCookie(res.data.user.role === 'superadmin' ? 'admin' : 'user');
  return res.data.user;
}

export async function getMe(): Promise<AuthUser> {
  const res = await api.get<{ ok: boolean; data: AuthUser }>('/auth/me');
  return res.data;
}

export async function getPlanInfo(): Promise<PlanInfo> {
  const res = await api.get<{ ok: boolean; data: PlanInfo }>('/auth/plan');
  return res.data;
}

export function logout() {
  clearTokens();
  window.location.href = '/login';
}

export function planHasFeature(planInfo: PlanInfo | null, feature: string): boolean {
  return planInfo?.features.includes(feature) ?? false;
}

// Backwards compat for middleware (kept for cookie-based session check)
export function setSession(role: "user" | "admin") {
  document.cookie = `${SESSION_COOKIE}=${role}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearSession() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}
