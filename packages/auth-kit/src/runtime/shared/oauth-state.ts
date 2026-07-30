import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

const STATE_EXPIRY_SECONDS = 600;
const STATE_SECRET =
  process.env.NEXTAUTH_SECRET || process.env.CASDOOR_CLIENT_SECRET || 'dev-state-secret';

export const pkceCookiePrefix = 'pkce_code_verifier';

export interface StatePayload {
  nonce: string;
  issuedAt: number;
}

function signStatePayload(payload: StatePayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', STATE_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function decodeStatePayload(state: string): StatePayload | null {
  const [body, signature] = state.split('.');

  if (!body || !signature) {
    return null;
  }

  const expectedSignature = crypto.createHmac('sha256', STATE_SECRET).update(body).digest('base64url');

  if (
    expectedSignature.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
  ) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as StatePayload;
  } catch {
    return null;
  }
}

export function generateStateToken(): string {
  return signStatePayload({
    nonce: crypto.randomUUID(),
    issuedAt: Date.now(),
  });
}

export function getPkceCookieName(state: string): string {
  const digest = crypto.createHash('sha256').update(state).digest('base64url');
  return `${pkceCookiePrefix}.${digest}`;
}

export async function verifyState(stateFromUrl: string): Promise<boolean> {
  const payload = decodeStatePayload(stateFromUrl);
  if (!payload) {
    return false;
  }

  return Date.now() - payload.issuedAt <= STATE_EXPIRY_SECONDS * 1000;
}

export function parseStateToken(token: string | null | undefined): StatePayload | null {
  if (!token) return null;
  return decodeStatePayload(token);
}

export function verifyStateToken(token: string | null | undefined): boolean {
  if (!token) return false;
  return Boolean(decodeStatePayload(token));
}
