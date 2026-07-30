import type { NextRequest } from 'next/server';
import type { AuthKitConfig } from '../shared/types';
import { createAuthorizeEntryResponse } from './entry';

export function createAuthorizeRouteHandler(config: AuthKitConfig) {
  return async (request: NextRequest) => createAuthorizeEntryResponse(request, config);
}
