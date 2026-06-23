import { getRequestOrigin as getCoreRequestOrigin } from './origin.ts';

export const PUBLIC_ORIGIN_COOKIE_NAME = 'auth_origin';

function isContainerOrigin(origin: string): boolean {
  try {
    return new URL(origin).hostname === '0.0.0.0';
  } catch {
    return true;
  }
}

export function getRequestOrigin(request: Request, appUrl?: string): string {
  return getCoreRequestOrigin(request, appUrl);
}

export function setPublicOriginCookie(response: { cookies: { set: (...args: any[]) => void } }, origin: string, secure: boolean) {
  response.cookies.set(PUBLIC_ORIGIN_COOKIE_NAME, origin, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
  });
}

export function clearPublicOriginCookie(response: { cookies: { set: (...args: any[]) => void } }, secure: boolean) {
  response.cookies.set(PUBLIC_ORIGIN_COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 0,
  });
}

export function getStoredPublicOrigin(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  for (const entry of cookieHeader.split(';')) {
    const [rawName, ...valueParts] = entry.trim().split('=');
    if (rawName === PUBLIC_ORIGIN_COOKIE_NAME) {
      const value = valueParts.join('=').trim();
      if (!value) {
        return null;
      }
      try {
        const decoded = decodeURIComponent(value);
        return isContainerOrigin(decoded) ? null : decoded;
      } catch {
        return isContainerOrigin(value) ? null : value;
      }
    }
  }

  return null;
}
