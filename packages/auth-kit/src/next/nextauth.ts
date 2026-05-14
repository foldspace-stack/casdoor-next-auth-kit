import type { AuthBusinessAdapter, AuthKitConfig } from '../types';

export interface NextAuthRouteOptions {
  config: AuthKitConfig;
  adapter?: AuthBusinessAdapter;
}

export function createNextAuthRouteHandler(_options: NextAuthRouteOptions) {
  const handler = async () => new Response('NextAuth route is not wired in the scaffold yet.', { status: 501 });
  return { GET: handler, POST: handler };
}
