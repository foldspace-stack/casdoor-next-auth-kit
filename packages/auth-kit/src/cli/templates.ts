import { customBegin, customEnd } from './fs';
import { buildAuthPrismaSchemaTemplate } from '../prisma/schema-template';
import { AUTH_KIT_ENV_FILES, buildManagedEnvTemplate } from '../core/env';

export function authLoginRouteTemplate() {
  return `import { loginHandler } from '../../auth-config';

export const dynamic = 'force-dynamic';

export const GET = loginHandler;
`;
}

export function authSignupRouteTemplate() {
  return `import { signupHandler } from '../../auth-config';

export const dynamic = 'force-dynamic';

export const GET = signupHandler;
`;
}

export function authorizeRouteTemplate() {
  return `import { authorizeHandler } from '../../../auth-config';

export const dynamic = 'force-dynamic';

export const GET = authorizeHandler;
`;
}

export function signupAuthorizeRouteTemplate() {
  return `import { authorizeHandler } from '../../../auth-config';

export const dynamic = 'force-dynamic';

export const GET = authorizeHandler;
`;
}

export function callbackRouteTemplate() {
  return `import { callbackHandler } from '../auth-config';

export const dynamic = 'force-dynamic';

export const GET = callbackHandler;
`;
}

export function logoutRouteTemplate() {
  return `import { logoutHandler } from '../auth-config';

export const dynamic = 'force-dynamic';

export const GET = logoutHandler;
`;
}

export function callbackErrorPageTemplate() {
  return `import { ClearDomainCookiesButton } from './clear-domain-cookies-button';

export const dynamic = 'force-dynamic';

export default async function CallbackErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; message?: string; details?: string }>;
}) {
  const params = await searchParams;

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        background:
          'radial-gradient(circle at top, rgba(99, 102, 241, 0.12) 0, rgba(99, 102, 241, 0) 38%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
      }}
    >
      <section
        style={{
          width: 'min(100%, 400px)',
          borderRadius: 28,
          padding: '24px 20px',
          boxSizing: 'border-box',
          background: 'rgba(255, 255, 255, 0.96)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 22px 52px rgba(15, 23, 42, 0.12)',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            margin: '0 auto 14px',
            display: 'grid',
            placeItems: 'center',
            borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.1))',
            color: '#b91c1c',
            fontSize: 28,
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          !
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            padding: '6px 12px',
            borderRadius: 9999,
            background: 'rgba(254, 226, 226, 0.9)',
            color: '#b91c1c',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          认证失败
        </div>
        <h2 style={{ margin: 0, fontSize: 24, lineHeight: 1.2, color: '#0f172a' }}>{params.title ?? 'Callback Error'}</h2>
        <p style={{ margin: '12px 0 0', color: '#334155', lineHeight: 1.6 }}>{params.message ?? 'Unknown callback failure.'}</p>
        {params.details ? (
          <pre
            style={{
              margin: '14px 0 0',
              maxHeight: 140,
              overflow: 'auto',
              padding: 14,
              borderRadius: 18,
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#f8fafc',
              color: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {params.details}
          </pre>
        ) : null}
${customBegin}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        <ClearDomainCookiesButton />
          <a href="/" style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center', minHeight: 44, padding: '0 16px', boxSizing: 'border-box', borderRadius: 9999, border: '1px solid rgba(148, 163, 184, 0.35)', color: '#0f172a', textDecoration: 'none', background: 'rgba(248, 250, 252, 0.9)' }}>返回首页</a>
          <a href="/auth/login" style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center', minHeight: 44, padding: '0 16px', boxSizing: 'border-box', borderRadius: 9999, border: '1px solid rgba(148, 163, 184, 0.35)', color: '#0f172a', textDecoration: 'none', background: 'rgba(248, 250, 252, 0.9)' }}>重新登录</a>
          <a href="/auth/signup" style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center', minHeight: 44, padding: '0 16px', boxSizing: 'border-box', borderRadius: 9999, border: '1px solid rgba(148, 163, 184, 0.35)', color: '#0f172a', textDecoration: 'none', background: 'rgba(248, 250, 252, 0.9)' }}>去注册</a>
        </div>
${customEnd}
      </section>
    </main>
  );
}
`;
}

export function callbackErrorClearCookiesButtonTemplate() {
  return `'use client';

import { useState } from 'react';

const AUTH_COOKIE_NAMES = [
  'auth_origin',
  'auth_redirect',
  'oauth_state',
  'pkce_code_verifier',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.csrf-token',
  '__Secure-next-auth.csrf-token',
  '__Host-next-auth.csrf-token',
];

function getPathCandidates(pathname: string): string[] {
  const normalized = pathname.startsWith('/') ? pathname : '/' + pathname;
  const segments = normalized.split('/').filter(Boolean);
  const paths = new Set<string>(['/']);

  let current = '';
  for (const segment of segments) {
    current += '/' + segment;
    paths.add(current);
  }

  return [...paths];
}

function getDomainCandidates(hostname: string): string[] {
  const normalized = hostname.toLowerCase();
  if (
    normalized === 'localhost' ||
    normalized.endsWith('.localhost') ||
    /^\\d+\\.\\d+\\.\\d+\\.\\d+$/.test(normalized) ||
    /^\\[[^\\]]+\\]$/.test(normalized)
  ) {
    return [];
  }

  const parts = normalized.split('.');
  if (parts.length < 2) {
    return [];
  }

  const domains = new Set<string>();
  for (let index = 0; index < parts.length - 1; index++) {
    const suffix = parts.slice(index).join('.');
    domains.add(suffix);
    domains.add('.' + suffix);
  }

  return [...domains];
}

function expireCookie(name: string, path: string, domain?: string) {
  const pieces = [
    name + '=',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Path=' + path,
    'SameSite=Lax',
  ];

  if (domain) {
    pieces.push('Domain=' + domain);
  }

  if (window.location.protocol === 'https:') {
    pieces.push('Secure');
  }

  document.cookie = pieces.join('; ');
}

${customBegin}
export function ClearDomainCookiesButton() {
  const [cleared, setCleared] = useState(false);

  const handleClick = () => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const names = new Set<string>(AUTH_COOKIE_NAMES);
    for (const entry of document.cookie.split(';')) {
      const [rawName] = entry.trim().split('=');
      if (rawName) {
        names.add(rawName);
      }
    }

    const pathCandidates = getPathCandidates(window.location.pathname);
    const domainCandidates = getDomainCandidates(window.location.hostname);

    for (const name of names) {
      for (const path of pathCandidates) {
        expireCookie(name, path);
        for (const domain of domainCandidates) {
          expireCookie(name, path, domain);
        }
      }
    }

    setCleared(true);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={cleared}
      style={{
        display: 'inline-flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        padding: '0 16px',
        boxSizing: 'border-box',
        borderRadius: 9999,
        border: '1px solid rgba(148, 163, 184, 0.35)',
        color: '#0f172a',
        background: cleared ? 'rgba(220, 252, 231, 0.92)' : 'rgba(248, 250, 252, 0.9)',
        cursor: cleared ? 'default' : 'pointer',
      }}
    >
      {cleared ? '已清空' : '清空当前域 Cookie'}
    </button>
  );
}
${customEnd}
`;
}

export function authConfigTemplate() {
  return `import {
  createCallbackHandler,
  createCasdoorApiProxyHandler,
  createCasdoorCommerceProxyHandler,
  createAuthorizeRouteHandler,
  createLoginRouteHandler,
  createLogoutHandler,
  createNextAuthOptions,
  createSignupRouteHandler,
  type AuthBusinessAdapter,
  type AuthKitConfig,
  type AuthPersistenceAdapter,
} from '@foldspace-fe/casdoor-next-auth-kit';
import { isGlobalAdminEmail } from '@foldspace-fe/casdoor-next-auth-kit';
import { paymentSuccessHandler as billingPaymentSuccessHandler } from '@/lib/billing/payment-success';
import { paymentFinishedHandler as billingPaymentFinishedHandler } from '@/lib/billing/payment-finished';

export function createAuthKitConfig(): AuthKitConfig {
  return {
    appUrl: process.env.APP_URL || '',
    nextauthSecret: process.env.NEXTAUTH_SECRET || 'dev-nextauth-secret',
    logoutRedirectPath: process.env.NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT_PATH || '/',
    casdoor: {
      serverUrl: process.env.NEXT_PUBLIC_CASDOOR_SERVER_URL || process.env.CASDOOR_SERVER_URL || '',
      clientId: process.env.NEXT_PUBLIC_CASDOOR_CLIENT_ID || process.env.CASDOOR_CLIENT_ID || '',
      clientSecret: process.env.CASDOOR_CLIENT_SECRET || '',
      appName: process.env.NEXT_PUBLIC_CASDOOR_APP_NAME || '',
      organizationName: process.env.NEXT_PUBLIC_CASDOOR_ORGANIZATION_NAME || '',
      redirectPath: process.env.NEXT_PUBLIC_CASDOOR_REDIRECT_PATH || '/callback',
      signinPath: process.env.NEXT_PUBLIC_CASDOOR_SIGNIN_PATH || '/login/oauth/authorize',
    },
  };
}

export const authKitConfig = createAuthKitConfig();

export const adapter: AuthBusinessAdapter = {
  isAdminEmail: isGlobalAdminEmail,
};

export const persistence: AuthPersistenceAdapter = {
  async syncAuthUser() {
    return;
  },
  async findAuthUser() {
    return null;
  },
};

export const paymentSuccessHandler = billingPaymentSuccessHandler;
export const paymentFinishedHandler = billingPaymentFinishedHandler;

export const loginHandler = createLoginRouteHandler(authKitConfig);
export const signupHandler = createSignupRouteHandler(authKitConfig);
export const authorizeHandler = createAuthorizeRouteHandler(authKitConfig);
export const callbackHandler = createCallbackHandler({
  config: authKitConfig,
  adapter,
  persistence,
});
export const logoutHandler = createLogoutHandler(authKitConfig);
export const authOptions = createNextAuthOptions({
  config: authKitConfig,
  adapter,
  persistence,
});
export const apiProxyHandler = createCasdoorApiProxyHandler(authKitConfig, '/auth/api', '/api');
export const commerceProxyHandler = createCasdoorCommerceProxyHandler(authKitConfig, '/auth/api/commerce', '/api/commerce');
`;
}

export function nextAuthRouteTemplate() {
  return `import NextAuth from 'next-auth';
import { createNextAuthOptions } from '@foldspace-fe/casdoor-next-auth-kit';
import { adapter, authKitConfig, persistence } from '../../../auth-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const handler = NextAuth(
  createNextAuthOptions({
    config: authKitConfig,
    adapter,
    persistence,
  }),
);

export const GET = handler;
export const POST = handler;
`;
}

export function paymentSuccessRouteTemplate() {
  return `import { createBillingPaymentSuccessRouteHandler } from '@foldspace-fe/casdoor-next-auth-kit';
import { authKitConfig, paymentSuccessHandler } from '../../../auth-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = createBillingPaymentSuccessRouteHandler({
  appUrl: authKitConfig.appUrl,
  fallbackRedirect: '/auth/payment/finished',
  handler: paymentSuccessHandler,
});
`;
}

export function paymentFinishedRouteTemplate() {
  return `import { createBillingPaymentFinishedRouteHandler } from '@foldspace-fe/casdoor-next-auth-kit';
import { authKitConfig, paymentFinishedHandler } from '../../../auth-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = createBillingPaymentFinishedRouteHandler({
  appUrl: authKitConfig.appUrl,
  fallbackRedirect: '/',
  handler: paymentFinishedHandler,
});
`;
}

export function billingPaymentSuccessHandlerTemplate() {
  return `import type { BillingPaymentSuccessHandler } from '@foldspace-fe/casdoor-next-auth-kit/billing';

${customBegin}
const paymentSuccessHandlerImpl: BillingPaymentSuccessHandler = async () => {
  return;
};
${customEnd}

export const paymentSuccessHandler: BillingPaymentSuccessHandler = paymentSuccessHandlerImpl;
`;
}

export function billingPaymentFinishedHandlerTemplate() {
  return `import type { BillingPaymentFinishedHandler } from '@foldspace-fe/casdoor-next-auth-kit/billing';

${customBegin}
const paymentFinishedHandlerImpl: BillingPaymentFinishedHandler = async () => {
  return;
};
${customEnd}

export const paymentFinishedHandler: BillingPaymentFinishedHandler = paymentFinishedHandlerImpl;
`;
}

    export function authIndexHtmlTemplate() {
      return `export { AUTH_INDEX_HTML, createAuthIndexHtml } from '@foldspace-fe/casdoor-next-auth-kit';
`;
    }

    export function prismaSchemaTemplate() {
      return buildAuthPrismaSchemaTemplate();
    }

export function apiProxyRouteTemplate() {
  return `import { apiProxyHandler } from '../../../auth-config';

export const dynamic = 'force-dynamic';

export const GET = apiProxyHandler;
export const HEAD = apiProxyHandler;
export const POST = apiProxyHandler;
export const PUT = apiProxyHandler;
export const PATCH = apiProxyHandler;
export const DELETE = apiProxyHandler;
export const OPTIONS = apiProxyHandler;
`;
}

export function commerceProxyRouteTemplate() {
  return `import { commerceProxyHandler } from '../../../../auth-config';

export const dynamic = 'force-dynamic';

export const GET = commerceProxyHandler;
export const HEAD = commerceProxyHandler;
export const POST = commerceProxyHandler;
export const PUT = commerceProxyHandler;
export const PATCH = commerceProxyHandler;
export const DELETE = commerceProxyHandler;
export const OPTIONS = commerceProxyHandler;
`;
}

    export function envTemplate(file: typeof AUTH_KIT_ENV_FILES[number], existingContent = '') {
      return buildManagedEnvTemplate(file, existingContent);
    }
