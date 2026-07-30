import type { NextRequest } from 'next/server';
import type { AuthKitConfig } from '../shared/types';
import { createLoginEntryResponse } from './entry';

export function createLoginRouteHandler(config: AuthKitConfig) {
  return async (request: NextRequest) => createLoginEntryResponse(request, config);
}
