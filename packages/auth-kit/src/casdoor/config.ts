import type { AuthKitConfig } from '../types';

export function getCasdoorAuthorizeUrl(config: AuthKitConfig, params: { state: string; codeChallenge: string; redirectUri: string; kind: 'login' | 'signup' }): string {
  const base = new URL(config.casdoor.signinPath ?? '/login/oauth/authorize', config.casdoor.serverUrl);
  base.searchParams.set('response_type', 'code');
  base.searchParams.set('client_id', config.casdoor.clientId);
  base.searchParams.set('redirect_uri', params.redirectUri);
  base.searchParams.set('scope', 'profile');
  base.searchParams.set('state', params.state);
  base.searchParams.set('code_challenge', params.codeChallenge);
  base.searchParams.set('code_challenge_method', 'S256');
  if (params.kind === 'signup') {
    base.searchParams.set('action', 'signup');
  }
  return base.toString();
}

export function getCasdoorTokenUrl(config: AuthKitConfig): string {
  return new URL('/api/login/oauth/access_token', config.casdoor.serverUrl).toString();
}

export function getCasdoorUserInfoUrl(config: AuthKitConfig): string {
  return new URL('/api/userinfo', config.casdoor.serverUrl).toString();
}
