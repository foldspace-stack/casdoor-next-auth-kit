export function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const origin = new URL(value).origin;
    return isContainerOrigin(origin) ? null : origin;
  } catch {
    return null;
  }
}

function isContainerOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === '0.0.0.0' || hostname === '::' || hostname === '[::]';
  } catch {
    return true;
  }
}

function firstForwardedValue(value: string | null): string | null {
  return value?.split(',')[0]?.trim() || null;
}

function normalizeHostOrigin(host: string | null, proto: string | null, appUrl?: string): string | null {
  if (!host || host === '0.0.0.0' || host.startsWith('0.0.0.0:')) {
    return null;
  }

  const configured = normalizeOrigin(appUrl);
  const configuredProtocol = configured ? new URL(configured).protocol.replace(':', '') : null;
  const protocol = proto || configuredProtocol || 'https';
  return normalizeOrigin(protocol + '://' + host);
}

function normalizeFirstEnvOrigin(value: string | null | undefined): string | null {
  const candidate = value?.split(',')[0]?.trim();
  if (!candidate) {
    return null;
  }
  return normalizeOrigin(candidate.includes('://') ? candidate : `https://${candidate}`);
}

export function getRequestOrigin(request: Request, appUrl?: string): string {
  const referer = normalizeOrigin(request.headers.get('referer'));
  if (referer) return referer;

  const origin = normalizeOrigin(request.headers.get('origin'));
  if (origin) return origin;

  const forwardedProto = firstForwardedValue(request.headers.get('x-forwarded-proto'));
  const forwardedHost = firstForwardedValue(request.headers.get('x-forwarded-host'));
  const forwardedOrigin = normalizeHostOrigin(forwardedHost, forwardedProto, appUrl);
  if (forwardedOrigin) return forwardedOrigin;

  // Coolify / Traefik may keep request.url at the container listener
  // (0.0.0.0:PORT), while the Host header still carries the public domain.
  // Never use the container host as a public OAuth origin.
  const hostOrigin = normalizeHostOrigin(request.headers.get('host'), forwardedProto, appUrl);
  if (hostOrigin) return hostOrigin;

  const configured = normalizeOrigin(appUrl);
  if (configured) return configured;

  // Runtime config can lag behind generated auth-config.ts in deployed images.
  // Keep these env fallbacks here as a final safety net for Coolify multi-domain
  // deployments, but still reject 0.0.0.0 through normalizeOrigin().
  const envConfigured =
    normalizeFirstEnvOrigin(process.env.APP_URL) ||
    normalizeFirstEnvOrigin(process.env.NEXTAUTH_URL) ||
    normalizeFirstEnvOrigin(process.env.SERVICE_URL_WEB) ||
    normalizeFirstEnvOrigin(process.env.COOLIFY_URL) ||
    normalizeFirstEnvOrigin(process.env.SERVICE_FQDN_WEB) ||
    normalizeFirstEnvOrigin(process.env.COOLIFY_FQDN);
  if (envConfigured) return envConfigured;

  return normalizeOrigin(request.url) || 'http://localhost';
}

export function resolvePublicOrigin(request: Request, appUrl?: string): string {
  return getRequestOrigin(request, appUrl);
}
