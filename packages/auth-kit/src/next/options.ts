import NextAuth from 'next-auth';
import type { NextAuthOptions, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { AuthBusinessAdapter, AuthKitConfig, AuthPersistenceAdapter, AuthUser, AuthUserRole } from '../types';
import { normalizeAuthKitConfig } from '../core/config';
import { decodeSessionToken, encodeSessionToken } from '../core/session-token';
import { isGlobalAdminEmail } from '../core/admin';
import { buildAuthUserFromToken } from '../core/auth-role';

export interface NextAuthRouteOptions {
  config: AuthKitConfig;
  adapter?: AuthBusinessAdapter;
  persistence?: AuthPersistenceAdapter;
  providers?: NextAuthOptions['providers'];
}

export interface AuthTokenPayload extends JWT {
  id?: string;
  name?: string;
  email?: string;
  picture?: string | null;
  userId?: string;
  accessToken?: string;
  expiresAt?: number;
  tokenBalance?: number;
  isVip?: boolean;
  isAdmin?: boolean;
  role?: AuthUserRole;
}

export interface AuthSessionUser {
  id?: string;
  isAdmin?: boolean;
  role?: AuthUserRole;
  tokenBalance?: number;
  isVip?: boolean;
}

export interface AuthSession extends Session {
  accessToken?: string;
  expiresAt?: number;
  user?: AuthSessionUser & NonNullable<Session['user']>;
}

export function resolveAuthUserFromToken(token: AuthTokenPayload, adapter?: AuthBusinessAdapter): AuthUser {
  const email = typeof token.email === 'string' ? token.email : null;
  const isAdmin = Boolean(token.isAdmin) || token.role === 'admin' || Boolean(adapter?.isAdminEmail?.(email)) || isGlobalAdminEmail(email);

  return buildAuthUserFromToken(
    {
      userId: token.userId,
      sub: token.sub,
      id: token.id,
      name: token.name,
      email,
      picture: token.picture ?? null,
      isAdmin: token.isAdmin,
      role: token.role,
      tokenBalance: token.tokenBalance,
      isVip: token.isVip,
    },
    isAdmin,
  );
}

export function createNextAuthOptions(options: NextAuthRouteOptions): NextAuthOptions {
  const normalized = normalizeAuthKitConfig(options.config);

  return {
    providers: options.providers ?? [],
    session: {
      strategy: 'jwt',
    },
    jwt: {
      encode: encodeSessionToken,
      decode: decodeSessionToken,
    },
    pages: {
      signIn: '/login',
      error: '/callback/error',
    },
    callbacks: {
      async jwt({ token, account, profile }) {
        const typedToken = token as AuthTokenPayload;

        if (account) {
          typedToken.accessToken = account.access_token;
          typedToken.expiresAt = account.expires_at ? account.expires_at * 1000 : undefined;
        }

        if (profile && typeof profile === 'object') {
          const typedProfile = profile as Partial<AuthUser> & {
            sub?: string;
            id?: string;
            picture?: string;
          };

          typedToken.userId = typedProfile.id || typedProfile.sub || typedToken.userId;
          typedToken.name = typedProfile.name || typedToken.name;
          typedToken.email = typedProfile.email || typedToken.email;
          typedToken.picture = typedProfile.image || typedProfile.picture || typedToken.picture;
          typedToken.isAdmin = Boolean(typedProfile.isAdmin ?? typedToken.isAdmin);
          typedToken.role =
            typedProfile.role === 'admin' || typedProfile.role === 'user'
              ? typedProfile.role
              : typedToken.role ?? (typedToken.isAdmin ? 'admin' : 'user');
          typedToken.tokenBalance = typedProfile.tokenBalance ?? typedToken.tokenBalance ?? 2580;
          typedToken.isVip = typedProfile.isVip ?? typedToken.isVip ?? true;
        }

        return typedToken;
      },
      async session({ session, token }) {
        const typedSession = session as AuthSession;
        const typedToken = token as AuthTokenPayload;
        const tokenUserId = typedToken.userId || typedToken.sub || typedToken.id || '';
        const tokenEmail = typeof typedToken.email === 'string' ? typedToken.email : null;
        const persistedUser = options.persistence?.findAuthUser
          ? await options.persistence.findAuthUser({ id: tokenUserId || undefined, email: tokenEmail })
          : null;
        const resolvedUser = persistedUser ?? resolveAuthUserFromToken(typedToken, options.adapter);

        if (typedSession.user) {
          typedSession.user.id = resolvedUser.id;
          typedSession.user.isAdmin = resolvedUser.isAdmin;
          typedSession.user.role = resolvedUser.role;
          typedSession.user.tokenBalance = resolvedUser.tokenBalance;
          typedSession.user.isVip = resolvedUser.isVip;
        }

        typedSession.accessToken = typedToken.accessToken;
        typedSession.expiresAt = typedToken.expiresAt;
        typedSession.user = {
          ...(typedSession.user || {}),
          name: typedSession.user?.name || resolvedUser.name,
          email: typedSession.user?.email || resolvedUser.email,
          image: typedSession.user?.image || resolvedUser.image,
          id: resolvedUser.id,
          isAdmin: resolvedUser.isAdmin,
          role: resolvedUser.role,
          tokenBalance: resolvedUser.tokenBalance,
          isVip: resolvedUser.isVip,
        };

        return typedSession;
      },
    },
    events: {
      async signOut({ token }) {
        const typedToken = token as AuthTokenPayload | null;
        if (!typedToken?.accessToken || !normalized.appUrl) {
          return;
        }

        try {
          await fetch(new URL('/api/casdoor/logout', normalized.appUrl).toString(), {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${typedToken.accessToken}`,
            },
          });
        } catch {
          // ignored
        }
      },
    },
    secret: normalized.nextauthSecret,
  };
}

export function createNextAuthRouteHandler(options: NextAuthRouteOptions) {
  const handler = NextAuth(createNextAuthOptions(options));
  return {
    GET: handler,
    POST: handler,
  };
}
