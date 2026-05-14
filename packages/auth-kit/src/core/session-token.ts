import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import type { JWT, JWTDecodeParams, JWTEncodeParams } from 'next-auth/jwt';

const DEFAULT_MAX_AGE = 30 * 24 * 60 * 60;

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function createSignature(input: string, secret: string | Buffer): string {
  return crypto.createHmac('sha256', secret).update(input).digest('base64url');
}

function timingSafeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export async function encodeSessionToken(params: JWTEncodeParams): Promise<string> {
  const { token = {}, secret, maxAge = DEFAULT_MAX_AGE } = params;
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      ...token,
      iat: issuedAt,
      exp: issuedAt + maxAge,
      jti: crypto.randomUUID(),
    }),
  );
  const signature = createSignature(`${header}.${payload}`, secret);

  return `${header}.${payload}.${signature}`;
}

export async function decodeSessionToken(params: JWTDecodeParams): Promise<JWT | null> {
  const { token, secret } = params;

  if (!token) {
    return null;
  }

  const [header, payload, signature] = token.split('.');

  if (!header || !payload || !signature) {
    return null;
  }

  const expectedSignature = createSignature(`${header}.${payload}`, secret);

  if (!timingSafeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const parsedPayload = JSON.parse(base64UrlDecode(payload)) as JWT & { exp?: number };

    if (parsedPayload.exp && parsedPayload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return parsedPayload;
  } catch {
    return null;
  }
}
