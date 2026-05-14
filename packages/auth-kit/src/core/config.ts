import type { AuthKitConfig } from '../types';

export function normalizeAuthKitConfig(config: AuthKitConfig): AuthKitConfig {
  return {
    ...config,
    casdoor: {
      redirectPath: '/callback',
      signinPath: '/login/oauth/authorize',
      ...config.casdoor
    },
    cookie: {
      secure: 'auto',
      ...config.cookie
    },
    session: {
      maxAgeSeconds: 60 * 60 * 24 * 7,
      ...config.session
    }
  };
}
