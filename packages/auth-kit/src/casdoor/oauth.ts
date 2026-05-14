import type { AuthKitConfig, CasdoorUserInfo, OAuthTokens } from '../types';
import { getCasdoorTokenUrl, getCasdoorUserInfoUrl } from './config';

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
