import type { NextRequest } from 'next/server';
import type { AuthKitConfig } from '../shared/types.ts';
import { createLoginEntryResponse } from './entry.ts';

export function createLoginRouteHandler(config: AuthKitConfig) {
  return async (request: NextRequest) => createLoginEntryResponse(request, config);
}
