import type { NextRequest } from 'next/server';
import { createAuthorizeRouteHandler } from '@foldspace-fe/casdoor-next-auth-kit/next';
import { demoAuthConfig } from '../../../../lib/demo-auth';

export const dynamic = 'force-dynamic';

const handler = createAuthorizeRouteHandler(demoAuthConfig);

export async function GET(request: NextRequest) {
  return handler(request);
}
