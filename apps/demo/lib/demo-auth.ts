import type { AuthBusinessAdapter, AuthKitConfig } from '@foldspace-fe/casdoor-next-auth-kit';

export const demoAuthConfig: AuthKitConfig = {
  appUrl: process.env.APP_URL ?? 'http://localhost:3000',
  nextauthSecret: process.env.NEXTAUTH_SECRET ?? 'demo-secret',
  casdoor: {
    serverUrl: process.env.CASDOOR_SERVER_URL ?? 'https://auth.example.com',
    clientId: process.env.CASDOOR_CLIENT_ID ?? 'client-id',
    clientSecret: process.env.CASDOOR_CLIENT_SECRET ?? 'client-secret',
    appName: process.env.CASDOOR_APP_NAME ?? 'demo-app',
    organizationName: process.env.CASDOOR_ORGANIZATION_NAME ?? 'demo-org'
  }
};

export const demoAuthAdapter: AuthBusinessAdapter = {
  onUserSync: async (profile) => ({
    id: String(profile.id ?? profile.email ?? 'demo-user'),
    name: profile.name ?? profile.displayName ?? 'Demo User',
    email: profile.email ?? 'demo@example.com',
    image: profile.avatarUrl ?? null,
    isAdmin: Boolean(profile.isAdmin),
    tokenBalance: 2580,
    isVip: true
  }),
  resolvePostLoginRedirect: () => '/me',
  isAdminEmail: (email) => email === 'admin@example.com',
  resolveCommerceRedirect: (action, payload) => '/orders?action=' + action + '&payload=' + encodeURIComponent(JSON.stringify(payload)),
  enrichCommercePayload: (payload) => ({ ...payload, source: 'demo' })
};
