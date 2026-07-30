import type { NextRequest } from 'next/server';
import type { AuthKitConfig } from '../shared/types';
import { createSignupEntryResponse } from './entry';

export function createSignupRouteHandler(config: AuthKitConfig) {
  return async (request: NextRequest) => createSignupEntryResponse(request, config);
}
