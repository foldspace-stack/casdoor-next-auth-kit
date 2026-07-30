import type { NextRequest } from 'next/server';
import type { AuthKitConfig } from '../shared/types.ts';
import { createSignupEntryResponse } from './entry.ts';

export function createSignupRouteHandler(config: AuthKitConfig) {
  return async (request: NextRequest) => createSignupEntryResponse(request, config);
}
