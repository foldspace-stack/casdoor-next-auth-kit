const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

function toBase64Url(bytes: ArrayBuffer): string {
  const raw = Buffer.from(bytes).toString('base64');
  return raw.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export async function createPkcePair(): Promise<{ verifier: string; challenge: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(48));
  const verifier = Array.from(bytes, (byte) => chars[byte % chars.length]).join('');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: toBase64Url(digest) };
}
