export function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function getRequestOrigin(request: Request, appUrl?: string): string {
  const configured = normalizeOrigin(appUrl);
  if (configured) return configured;

  const referer = normalizeOrigin(request.headers.get('referer'));
  if (referer) return referer;

  const origin = normalizeOrigin(request.headers.get('origin'));
  if (origin) return origin;

  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  if (forwardedProto && forwardedHost) {
    return forwardedProto + '://' + forwardedHost;
  }

  return new URL(request.url).origin;
}

export function resolvePublicOrigin(request: Request, appUrl?: string): string {
  return getRequestOrigin(request, appUrl);
}
