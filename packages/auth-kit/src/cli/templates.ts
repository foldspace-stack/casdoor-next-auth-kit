import fs from 'node:fs';
import path from 'node:path';

import { customBegin, customEnd } from './fs';
import { buildAuthPrismaSchemaTemplate } from '../prisma/schema-template';
import { AUTH_KIT_ENV_FILES, buildManagedEnvTemplate, readManagedEnvValue } from '../core/env';

function getManagedEnvValue(key: string): string | null {
  for (const file of ['.env.local', '.env', '.env.production', '.env.example'] as const) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const value = readManagedEnvValue(fs.readFileSync(filePath, 'utf8'), key);
    if (value !== null) {
      return value;
    }
  }

  return null;
}

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

export function authConfigTemplate() {
  const billingPaymentSuccessHandlerImport = getManagedEnvValue('BILLING_PAYMENT_SUCCESS_HANDLER');
  const billingPaymentFinishedHandlerImport = getManagedEnvValue('BILLING_PAYMENT_FINISHED_HANDLER');
  const billingPaymentSuccessHandlerImportLine = billingPaymentSuccessHandlerImport
    ? `import { paymentSuccessHandler as billingPaymentSuccessHandler } from ${JSON.stringify(billingPaymentSuccessHandlerImport)};\n`
    : '';
  const billingPaymentFinishedHandlerImportLine = billingPaymentFinishedHandlerImport
    ? `import { paymentFinishedHandler as billingPaymentFinishedHandler } from ${JSON.stringify(billingPaymentFinishedHandlerImport)};\n`
    : '';

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
${billingPaymentSuccessHandlerImportLine}${billingPaymentFinishedHandlerImportLine}

export function createAuthKitConfig(): AuthKitConfig {
  return {
    appUrl: process.env.APP_URL || '',
    nextauthSecret: process.env.NEXTAUTH_SECRET || 'dev-nextauth-secret',
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

const authKitConfig = createAuthKitConfig();

${customBegin}
const adapter: AuthBusinessAdapter = {
  isAdminEmail: isGlobalAdminEmail,
};

const persistence: AuthPersistenceAdapter = {
  async syncAuthUser() {
    return;
  },
  async findAuthUser() {
    return null;
  },
};
${customEnd}

export const paymentSuccessHandler = ${billingPaymentSuccessHandlerImport ? 'billingPaymentSuccessHandler' : 'undefined'};
export const paymentFinishedHandler = ${billingPaymentFinishedHandlerImport ? 'billingPaymentFinishedHandler' : 'undefined'};

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
