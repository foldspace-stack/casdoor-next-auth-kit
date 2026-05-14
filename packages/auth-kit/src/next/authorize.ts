import type { NextRequest } from 'next/server';
import type { AuthKitConfig } from '../types';
import { createAuthorizeEntryResponse } from '../casdoor/entry';

export function createAuthorizeRouteHandler(config: AuthKitConfig) {
  return async (request: NextRequest) => createAuthorizeEntryResponse(request, config);
}
