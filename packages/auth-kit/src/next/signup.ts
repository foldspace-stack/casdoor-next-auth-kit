import type { NextRequest } from 'next/server';
import type { AuthKitConfig } from '../types';
import { createSignupEntryResponse } from '../casdoor/entry';

export function createSignupRouteHandler(config: AuthKitConfig) {
  return async (request: NextRequest) => createSignupEntryResponse(request, config);
}
