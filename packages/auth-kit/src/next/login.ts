import type { NextRequest } from 'next/server';
import type { AuthKitConfig } from '../types';
import { createLoginEntryResponse } from '../casdoor/entry';

export function createLoginRouteHandler(config: AuthKitConfig) {
  return async (request: NextRequest) => createLoginEntryResponse(request, config);
}
