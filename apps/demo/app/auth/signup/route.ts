import type { NextRequest } from 'next/server';
import { createSignupEntryResponse } from '@foldspace/casdoor-next-auth-kit';
import { demoAuthConfig } from '../../../lib/demo-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return createSignupEntryResponse(request, demoAuthConfig);
}
