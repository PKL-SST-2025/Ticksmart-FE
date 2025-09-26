// Simple API client skeleton for future integration
// Centralizes base URL, auth header handling, and typed helpers.

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export async function apiFetch<TResponse = unknown, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  // Try to parse JSON but allow empty bodies
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as TResponse;
  }
  return undefined as unknown as TResponse;
}

// Example endpoints (replace with real backend later)
export const Api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ token: string }>('/auth/login', { method: 'POST', body: { email, password } }),
    register: (payload: { fullName: string; email: string; password: string; phone?: string }) =>
      apiFetch<{ id: string }>('/auth/register', { method: 'POST', body: payload }),
  },
  events: {
    list: () => apiFetch<Array<{ id: number; title: string }>>('/events'),
    detail: (id: string | number) => apiFetch(`/events/${id}`),
  },
};
