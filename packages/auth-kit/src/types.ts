export interface CasdoorUserInfo {
  id?: string;
  name?: string | null;
  displayName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  isAdmin?: boolean;
  [key: string]: unknown;
}

export interface OAuthTokens {
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt?: number;
  [key: string]: unknown;
}

export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
  tokenBalance: number;
  isVip: boolean;
}

export interface AuthDatabaseFieldRequirement {
  name: string;
  type: string;
  required?: boolean;
  notes?: string;
}

export interface AuthDatabaseTableRequirement {
  name: string;
  purpose: string;
  fields: AuthDatabaseFieldRequirement[];
  uniqueKeys?: string[];
  indexes?: string[];
}

export interface AuthDatabaseContract {
  tables: AuthDatabaseTableRequirement[];
  notes?: string[];
}

export interface AuthPersistenceAdapter {
  syncAuthUser: (user: AuthUser) => Promise<void>;
  syncCommerceRecord?: (kind: 'order' | 'subscription' | 'invoice', payload: Record<string, unknown>) => Promise<void>;
}

export interface AuthKitConfig {
  appUrl?: string;
  nextauthSecret: string;
  casdoor: {
    serverUrl: string;
    clientId: string;
    clientSecret: string;
    appName: string;
    organizationName: string;
    redirectPath?: string;
    signinPath?: string;
  };
  cookie?: {
    secure?: 'auto' | boolean;
  };
  session?: {
    maxAgeSeconds?: number;
  };
}

export interface AuthBusinessAdapter {
  onUserSync?: (profile: CasdoorUserInfo, tokens: OAuthTokens) => Promise<AuthUser>;
  resolvePostLoginRedirect?: (user: AuthUser) => string;
  isAdminEmail?: (email: string | null) => boolean;
  resolveCommerceRedirect?: (action: 'purchase' | 'subscribe' | 'manage', payload: Record<string, unknown>) => string;
  enrichCommercePayload?: (payload: Record<string, unknown>) => Record<string, unknown>;
}

export interface AuthRuntimeContext {
  config: AuthKitConfig;
  adapter?: AuthBusinessAdapter;
  database?: AuthDatabaseContract;
  persistence?: AuthPersistenceAdapter;
}
