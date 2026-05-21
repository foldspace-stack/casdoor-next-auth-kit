import assert from 'node:assert/strict';
import test from 'node:test';

import { authConfigTemplate } from '../dist/cli-templates.js';

test('generated auth-config wires admin sync and role persistence', () => {
  const text = authConfigTemplate();

  assert.match(text, /import \{ paymentSuccessHandler as billingPaymentSuccessHandler \} from '@\/lib\/billing\/payment-success';/);
  assert.match(text, /onUserSync: async \(profile\)/);
  assert.match(text, /role: isAdmin \? 'admin' : 'user'/);
  assert.match(text, /async syncAuthUser\(user\)/);
  assert.match(text, /role: user\.role,/);
});
