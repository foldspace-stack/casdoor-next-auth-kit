import { createNextAuthRouteHandler } from '@foldspace/casdoor-next-auth-kit';
import { demoAuthAdapter, demoAuthConfig } from '../../../../lib/demo-auth';

const handler = createNextAuthRouteHandler({ config: demoAuthConfig, adapter: demoAuthAdapter });

export const GET = handler.GET;
export const POST = handler.POST;
