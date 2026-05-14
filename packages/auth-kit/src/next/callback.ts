import { NextResponse, type NextRequest } from 'next/server';
import type { AuthBusinessAdapter, AuthKitConfig } from '../types';

export interface CallbackHandlerOptions {
  config: AuthKitConfig;
  adapter?: AuthBusinessAdapter;
}

export function createCallbackHandler(_options: CallbackHandlerOptions) {
  return async function GET(request: NextRequest) {
    const errorUrl = new URL('/callback/error', new URL(request.url).origin);
    errorUrl.searchParams.set('title', 'Login Callback Failed');
    errorUrl.searchParams.set('message', 'callback_handler_not_implemented');
    return NextResponse.redirect(errorUrl);
  };
}
