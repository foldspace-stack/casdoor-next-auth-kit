import type { NextRequest } from 'next/server';
import { createLoginEntryResponse } from '@foldspace/casdoor-next-auth-kit';
import { demoAuthConfig } from '../../../lib/demo-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return createLoginEntryResponse(request, demoAuthConfig);
}
