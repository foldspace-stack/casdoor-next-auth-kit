import type { AuthKitConfig, CasdoorUserInfo, OAuthTokens } from '../types';
import { getCasdoorTokenUrl, getCasdoorUserInfoUrl } from './config';
import { Buffer } from 'node:buffer';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = parts[1];
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function exchangeCodeForToken(config: AuthKitConfig, code: string, redirectUri: string, codeVerifier: string): Promise<OAuthTokens> {
  const response = await fetch(getCasdoorTokenUrl(config), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: config.casdoor.clientId,
      client_secret: config.casdoor.clientSecret,
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    })
  });
  if (!response.ok) {
    throw new Error('Failed to exchange Casdoor authorization code.');
  }
  return (await response.json()) as OAuthTokens;
}

export async function fetchCasdoorUserInfo(config: AuthKitConfig, accessToken: string): Promise<CasdoorUserInfo> {
  const response = await fetch(getCasdoorUserInfoUrl(config), {
    headers: {
      authorization: 'Bearer ' + accessToken
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch Casdoor user profile.');
  }
  return (await response.json()) as CasdoorUserInfo;
}

export function decodeCasdoorAccessToken(accessToken: string): Record<string, unknown> | null {
  return decodeJwtPayload(accessToken);
}

export const exchangeCasdoorOAuthToken = exchangeCodeForToken;
