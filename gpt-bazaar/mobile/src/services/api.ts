export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

export const ALLOW_HTTP =
  (process.env.EXPO_PUBLIC_ALLOW_HTTP || 'true').toLowerCase() === 'true';

export function getWebSocketUrl(room: string): string {
  const wsBase = API_BASE_URL.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://');
  return `${wsBase}/ws/live/${encodeURIComponent(room)}`;
}

/**
 * Authoritative FastAPI backend client (backed by Firebase Firestore & Storage).
 * Enforces HTTPS unless EXPO_PUBLIC_ALLOW_HTTP="true" is explicitly enabled.
 */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!ALLOW_HTTP && API_BASE_URL.startsWith('http://')) {
    throw new Error(
      'Insecure HTTP API URL blocked because EXPO_PUBLIC_ALLOW_HTTP is not enabled.'
    );
  }
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API request failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as T;
}
