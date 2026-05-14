    import { customBegin, customEnd } from './fs';

    export function loginRouteTemplate() {
      return `import { createLoginEntryResponse } from '@foldspace/casdoor-next-auth-kit';
import { demoAuthConfig } from '../../../lib/demo-auth';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return createLoginEntryResponse(request, demoAuthConfig);
}
`;
    }

    export function signupRouteTemplate() {
      return `import { createSignupEntryResponse } from '@foldspace/casdoor-next-auth-kit';
import { demoAuthConfig } from '../../../lib/demo-auth';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return createSignupEntryResponse(request, demoAuthConfig);
}
`;
    }

    export function callbackRouteTemplate() {
      return `import { createCallbackHandler } from '@foldspace/casdoor-next-auth-kit';
import { demoAuthAdapter, demoAuthConfig } from '../../lib/demo-auth';

export const dynamic = 'force-dynamic';

export const GET = createCallbackHandler({ config: demoAuthConfig, adapter: demoAuthAdapter });

${customBegin}
// put project-specific session sync or redirect logic here
${customEnd}
`;
    }

    export function logoutRouteTemplate() {
      return `import { createLogoutHandler } from '@foldspace/casdoor-next-auth-kit';
import { demoAuthConfig } from '../../lib/demo-auth';

export const dynamic = 'force-dynamic';

export const GET = createLogoutHandler(demoAuthConfig);
`;
    }

    export function nextAuthRouteTemplate() {
      return `import { createNextAuthRouteHandler } from '@foldspace/casdoor-next-auth-kit';
import { demoAuthAdapter, demoAuthConfig } from '../../../../lib/demo-auth';

const handler = createNextAuthRouteHandler({ config: demoAuthConfig, adapter: demoAuthAdapter });

export const GET = handler.GET;
export const POST = handler.POST;
`;
    }

    export function apiProxyRouteTemplate() {
      return `import { createCasdoorApiProxyHandler } from '@foldspace/casdoor-next-auth-kit';
import { demoAuthConfig } from '../../../../lib/demo-auth';

const handler = createCasdoorApiProxyHandler(demoAuthConfig, '/auth/api');

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
`;
    }

    export function commerceProxyRouteTemplate() {
      return `import { createCasdoorCommerceProxyHandler } from '@foldspace/casdoor-next-auth-kit';
import { demoAuthConfig } from '../../../../../lib/demo-auth';

const handler = createCasdoorCommerceProxyHandler(demoAuthConfig, '/api/casdoor/commerce');

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
`;
    }

    export function envExampleTemplate() {
      return `APP_URL=https://localhost:3000
NEXTAUTH_URL=https://localhost:3000
NEXTAUTH_SECRET=replace-with-secret
CASDOOR_SERVER_URL=https://auth.example.com
CASDOOR_CLIENT_ID=client-id
CASDOOR_CLIENT_SECRET=client-secret
CASDOOR_APP_NAME=app-name
CASDOOR_ORGANIZATION_NAME=org-name
`;
    }
