export interface CasdoorUserInfo {
  id?: string;
  sub?: string;
  name?: string | null;
  displayName?: string | null;
  email?: string | null;
  picture?: string | null;
  avatarUrl?: string | null;
  isAdmin?: boolean;
  [key: string]: unknown;
}

export interface OAuthTokens {
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt?: number;
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  [key: string]: unknown;
}

export type AuthUserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
  role: AuthUserRole;
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
  findAuthUser?: (query: { id?: string; email?: string | null }) => Promise<AuthUser | null>;
  syncCommerceRecord?: (kind: 'order' | 'subscription' | 'invoice', payload: Record<string, unknown>) => Promise<void>;
}

export interface AuthKitConfig {
  appUrl?: string;
  nextauthSecret: string;
  logoutRedirectPath?: string;
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

export interface AuthIndexHtmlOptions {
  appName?: string;
  organizationName?: string;
  description?: string;
  staticOrigin?: string;
  casdoorOrigin?: string;
  apiProxyPrefix?: string;
  iconHref?: string;
  manifestHref?: string;
}

export type ManagedEnvFile = '.env' | '.env.local' | '.env.production' | '.env.example';

export interface ManagedEnvVariableDefinition {
  key: string;
  description: string;
  example: string;
  local?: string;
  production?: string;
  base?: string;
}

export interface PrismaSchemaFieldDefinition {
  name: string;
  type: string;
  attributes?: string[];
}

export interface PrismaSchemaModelDefinition {
  name: string;
  description: string;
  fields: PrismaSchemaFieldDefinition[];
  blockAttributes?: string[];
}
