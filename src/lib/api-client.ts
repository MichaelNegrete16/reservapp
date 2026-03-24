const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/reservapp-token=([^;]+)/);
  return match ? match[1] : null;
}

export function setToken(token: string) {
  document.cookie = `reservapp-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function setRefreshToken(token: string) {
  document.cookie = `reservapp-refresh=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearTokens() {
  document.cookie = 'reservapp-token=; path=/; max-age=0';
  document.cookie = 'reservapp-refresh=; path=/; max-age=0';
  document.cookie = 'reservapp-session=; path=/; max-age=0';
}

/**
 * Custom error class for plan limit errors (403 from backend)
 */
export class PlanLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlanLimitError';
  }
}

/**
 * Dispatch a global event when plan limit is hit.
 * The dashboard layout listens for this and shows the PlanLimitModal.
 */
function emitPlanLimitError(message: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('plan-limit-error', { detail: { message } }));
  }
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired');
  }

  const data = await res.json();

  if (!res.ok) {
    const message = data.message ?? `Error ${res.status}`;

    // Detect plan limit errors (403 with specific message patterns)
    if (res.status === 403 && (
      message.includes('límite') ||
      message.includes('plan') ||
      message.includes('Actualiza')
    )) {
      emitPlanLimitError(message);
      throw new PlanLimitError(message);
    }

    throw new Error(message);
  }

  return data;
}

export function get<T = unknown>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET' });
}

export function post<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function patch<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function del<T = unknown>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'DELETE' });
}

export const api = { get, post, patch, del };
