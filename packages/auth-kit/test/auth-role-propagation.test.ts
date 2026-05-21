import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAuthUserFromProfile,
  buildAuthUserFromToken,
  buildAuthUserSummary,
  resolveAuthUserRole,
} from '../src/core/auth-role.ts';

test('admin profile keeps role=admin through callback, token resolution, and hooks', () => {
  const mapped = buildAuthUserFromProfile(
    {
      id: 'u_1',
      sub: 'sub-u_1',
      email: 'admin@example.com',
      name: 'Admin User',
      displayName: 'Admin User',
      picture: 'https://example.com/avatar.png',
      isAdmin: true,
    },
    true,
  );

  assert.equal(mapped.isAdmin, true);
  assert.equal(mapped.role, 'admin');

  const token = {
    userId: 'u_1',
    email: 'admin@example.com',
    isAdmin: true,
    role: 'admin',
    tokenBalance: 2580,
    isVip: true,
  };

  const resolved = buildAuthUserFromToken(token, true);
  assert.equal(resolved.role, 'admin');
  assert.equal(resolved.isAdmin, true);

  const summary = buildAuthUserSummary({
    id: 'u_1',
    name: 'Admin User',
    email: 'admin@example.com',
    image: null,
    isAdmin: false,
    role: 'admin',
    tokenBalance: 2580,
    isVip: true,
  });

  assert.equal(summary.role, 'admin');
  assert.equal(summary.isAdmin, true);

  assert.equal(resolveAuthUserRole('admin', false), 'admin');
  assert.equal(resolveAuthUserRole(undefined, true), 'admin');
  assert.equal(resolveAuthUserRole(undefined, false), 'user');
});
