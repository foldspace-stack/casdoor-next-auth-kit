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

export function authConfigTemplate() {
  return `import {
  createCallbackHandler,
  createCasdoorApiProxyHandler,
  createCasdoorCommerceProxyHandler,
  createAuthorizeRouteHandler,
  createLoginRouteHandler,
  createLogoutHandler,
  createNextAuthOptions,
  createNextAuthRouteHandler,
  createSignupRouteHandler,
  type AuthBusinessAdapter,
  type AuthKitConfig,
  type AuthPersistenceAdapter,
  type AuthUser,
} from '@foldspace-fe/casdoor-next-auth-kit';
import { db } from '@/lib/db';
import { isGlobalAdminEmail } from '@/lib/auth-roles';
import { syncUserRecord } from '@/lib/user-record';

export function createAuthKitConfig(): AuthKitConfig {
  return {
    appUrl: process.env.APP_URL || process.env.NEXTAUTH_URL || '',
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

const adapter: AuthBusinessAdapter = {
  isAdminEmail: isGlobalAdminEmail,
};

const persistence: AuthPersistenceAdapter = {
  async syncAuthUser(user) {
    await syncUserRecord(user);
  },
  async findAuthUser({ id, email }) {
    const user = id
      ? await db.user.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            tokenBalance: true,
            isVip: true,
            isAdmin: true,
          },
        })
      : email
        ? await db.user.findFirst({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              tokenBalance: true,
              isVip: true,
              isAdmin: true,
            },
          })
        : null;

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      tokenBalance: Number(user.tokenBalance ?? 2580),
      isVip: Boolean(user.isVip ?? true),
      isAdmin: Boolean(user.isAdmin) || isGlobalAdminEmail(user.email),
    } satisfies AuthUser;
  },
};

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
export const nextAuthHandlers = createNextAuthRouteHandler({
  config: authKitConfig,
  adapter,
  persistence,
});
export const apiProxyHandler = createCasdoorApiProxyHandler(authKitConfig, '/auth/api', '/api');
export const commerceProxyHandler = createCasdoorCommerceProxyHandler(authKitConfig, '/auth/api/commerce', '/api/commerce');
`;
}

export function nextAuthRouteTemplate() {
  return `import { nextAuthHandlers } from '../../../auth-config';

export const dynamic = 'force-dynamic';

export const GET = nextAuthHandlers.GET;
export const POST = nextAuthHandlers.POST;
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
