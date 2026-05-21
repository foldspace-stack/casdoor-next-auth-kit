import assert from 'node:assert/strict';
import test from 'node:test';

import { authConfigTemplate } from '../dist/cli-templates.js';

test('generated auth-config wires admin sync and role persistence', () => {
  const text = authConfigTemplate();

  assert.match(
    text,
    /import \{\s+createCallbackHandler,\s+createCasdoorApiProxyHandler,\s+createCasdoorCommerceProxyHandler,\s+createAuthorizeRouteHandler,\s+createLoginRouteHandler,\s+createLogoutHandler,\s+createNextAuthOptions,\s+createSignupRouteHandler,\s+decodeCasdoorAccessToken,\s+isGlobalAdminEmail,\s+type AuthBusinessAdapter,\s+type AuthKitConfig,\s+type AuthPersistenceAdapter,\s+\} from '@foldspace-fe\/casdoor-next-auth-kit';/s,
  );
  assert.match(text, /import \{ syncUserRecord \} from '@\/lib\/user\/record';/);
  assert.match(text, /onUserSync: async \(profile, tokens\)/);
  assert.match(text, /const decodedAccessToken = accessToken \? decodeCasdoorAccessToken\(accessToken\) : null;/);
  assert.match(text, /role: isAdmin \? 'admin' : 'user'/);
  assert.match(text, /async syncAuthUser\(user\)/);
  assert.match(text, /await syncUserRecord\(user\);/);
});
