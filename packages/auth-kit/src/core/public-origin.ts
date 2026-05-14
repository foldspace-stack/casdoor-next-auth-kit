export const PUBLIC_ORIGIN_COOKIE_NAME = 'auth_origin';

export function getRequestOrigin(request: Request, appUrl?: string): string {
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      // ignore
    }
  }

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).origin;
    } catch {
      // ignore
    }
  }

  if (appUrl) {
    try {
      return new URL(appUrl).origin;
    } catch {
      // ignore
    }
  }

  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
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
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }

  return null;
}
