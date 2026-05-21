'use client';

import { useSession } from 'next-auth/react';
import { buildAuthJumpHref } from '../core/redirect';
import { buildAuthUserSummary, type AuthSummaryRole } from '../core/auth-role';
import type { AuthSession } from '../next/options';

export type AuthRole = AuthSummaryRole;

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

export function getUserSummary(session: AuthSession | null | undefined): AuthUserSummary {
  return buildAuthUserSummary(session?.user);
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
