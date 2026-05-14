import { createLogoutHandler } from '@foldspace/casdoor-next-auth-kit';
import { demoAuthConfig } from '../../lib/demo-auth';

export const dynamic = 'force-dynamic';

export const GET = createLogoutHandler(demoAuthConfig);
