export function isSecureRequest(request: Request, appUrl?: string): boolean {
  const url = new URL(request.url);
  if (url.protocol === 'https:') return true;

  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase();
  if (forwardedProto === 'https') return true;

  if (appUrl) {
    try {
      return new URL(appUrl).protocol === 'https:';
    } catch {
      return false;
    }
  }

  return false;
}
