'use client';

import { useSession } from 'next-auth/react';
import type { DefaultSession, Session } from 'next-auth';

export type AuthRole = 'guest' | 'user' | 'admin';

export interface AuthUserSummary {
  id: string | null;
  name: string;
  email: string | null;
  image: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  tokenBalance: number;
  isVip: boolean;
  role: AuthRole;
}

export interface AuthActions {
  loginHref: string;
  signupHref: string;
  logoutHref: string;
  accountHref: string;
  adminHref: string;
}

type AuthSessionUser = DefaultSession['user'] & {
  id?: string;
  isAdmin?: boolean;
  tokenBalance?: number;
  isVip?: boolean;
};

type AuthSession = Session & {
  user?: AuthSessionUser | null;
};

function getUserSummary(session: AuthSession | null | undefined): AuthUserSummary {
  const user = session?.user;
  const name = user?.name || '登录';
  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(user?.isAdmin);
  const role: AuthRole = !isAuthenticated ? 'guest' : isAdmin ? 'admin' : 'user';

  return {
    id: user?.id ?? null,
    name,
    email: user?.email ?? null,
    image: user?.image ?? null,
    isAuthenticated,
    isAdmin,
    tokenBalance: Number(user?.tokenBalance ?? 2580),
    isVip: Boolean(user?.isVip ?? true),
    role,
  };
}

export function useAuthSession() {
  return useSession();
}

export function useAuthUser(): AuthUserSummary {
  const { data: session } = useSession();
  return getUserSummary(session ?? null);
}

export function useAuthRole(): AuthRole {
  return useAuthUser().role;
}

export function useAuthActions(): AuthActions {
  const user = useAuthUser();

  return {
    loginHref: '/auth/login',
    signupHref: '/auth/signup',
    logoutHref: '/logout',
    accountHref: user.isAdmin ? '/admin' : '/user/account',
    adminHref: '/admin',
  };
}
