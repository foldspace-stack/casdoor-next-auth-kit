export const AUTH_REDIRECT_COOKIE_NAME = 'auth_redirect';

export function getAuthRedirectTarget(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  for (const entry of cookieHeader.split(';')) {
    const [rawName, ...valueParts] = entry.trim().split('=');
    if (rawName === AUTH_REDIRECT_COOKIE_NAME) {
      const value = valueParts.join('=').trim();
      if (!value) {
        return null;
      }
      let decoded = value;
      try {
        decoded = decodeURIComponent(value);
      } catch {
        // ignore
      }
      if (decoded.startsWith('/') && !decoded.startsWith('//')) {
        return decoded;
      }
      return null;
    }
  }

  return null;
}

export function setAuthRedirectCookie(
  response: { cookies: { set: (...args: any[]) => void } },
  target: string,
  secure: boolean,
) {
  response.cookies.set(AUTH_REDIRECT_COOKIE_NAME, target, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
  });
}

export function clearAuthRedirectCookie(
  response: { cookies: { set: (...args: any[]) => void } },
  secure: boolean,
) {
  response.cookies.set(AUTH_REDIRECT_COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 0,
  });
}
