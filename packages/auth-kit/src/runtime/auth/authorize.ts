import type { NextRequest } from 'next/server';
import type { AuthKitConfig } from '../shared/types.ts';
import { createAuthorizeEntryResponse } from './entry.ts';

export function createAuthorizeRouteHandler(config: AuthKitConfig) {
  return async (request: NextRequest) => createAuthorizeEntryResponse(request, config);
}
