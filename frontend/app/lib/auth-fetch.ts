import { getAccessToken } from '@/app/lib/session';

// Server-side helper to call backend API with bearer token from cookie
export async function authFetch(input: string | URL | Request, init: RequestInit = {}) {
  const token = await getAccessToken();
  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}

