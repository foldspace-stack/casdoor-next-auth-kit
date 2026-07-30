import { createLogoutHandler } from '@foldspace-fe/casdoor-next-auth-kit/next';
import { demoAuthConfig } from '../../lib/demo-auth';

export const dynamic = 'force-dynamic';

export const GET = createLogoutHandler(demoAuthConfig);
