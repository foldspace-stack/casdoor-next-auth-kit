import type { NextRequest } from 'next/server';
import { createCasdoorApiProxyHandler } from '@foldspace-fe/casdoor-next-auth-kit';
import { demoAuthConfig } from '../../../../lib/demo-auth';

const handler = createCasdoorApiProxyHandler(demoAuthConfig, '/auth/api');

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export function PATCH(request: NextRequest) { return handler(request); }
