import { cookies } from 'next/headers';
import 'server-only';

// Name constants for cookies
const ACCESS_COOKIE = 'access_token';

export async function createSession(access_token: string, expiresInSeconds?: number) {
  const cookieStore = await cookies();
  const maxAge = expiresInSeconds ?? 30 * 60; // default 30 min if backend not supplying
  const expires = new Date(Date.now() + maxAge * 1000);

  cookieStore.set(ACCESS_COOKIE, access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    expires,
  });
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
}

