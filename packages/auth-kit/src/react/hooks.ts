'use client';

import { useSession } from 'next-auth/react';
import { buildAuthJumpHref } from '../core/redirect';
import type { AuthSession } from '../next/options';

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

export interface AuthActionsOptions {
  redirect?: string | null;
}

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
  return useSession() as ReturnType<typeof useSession> & {
    data: AuthSession | null | undefined;
  };
}

export function useAuthUser(): AuthUserSummary {
  const { data: session } = useAuthSession();
  return getUserSummary(session ?? null);
}

export function useAuthRole(): AuthRole {
  return useAuthUser().role;
}

export function useAuthActions(options: AuthActionsOptions = {}): AuthActions {
  const user = useAuthUser();
  const redirect = options.redirect ?? null;

  return {
    loginHref: buildAuthJumpHref('login', redirect ?? undefined),
    signupHref: buildAuthJumpHref('signup', redirect ?? undefined),
    logoutHref: '/logout',
    accountHref: '/user/account',
    adminHref: '/admin',
  };
}
