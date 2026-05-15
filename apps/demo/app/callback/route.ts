import { createCallbackHandler } from '@foldspace-fe/casdoor-next-auth-kit';
import { demoAuthAdapter, demoAuthConfig } from '../../lib/demo-auth';

export const dynamic = 'force-dynamic';

export const GET = createCallbackHandler({ config: demoAuthConfig, adapter: demoAuthAdapter });
