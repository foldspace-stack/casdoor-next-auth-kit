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

test('token displayName is used when name is missing', () => {
  const resolved = buildAuthUserFromToken(
    {
      userId: 'u_2',
      displayName: 'cxj_test_u202606082',
      email: 'cxj_test_u202606082@chuangxiaoju.com',
      isAdmin: false,
      role: 'user',
      isVip: true,
      tokenBalance: 2580,
    },
    false,
  );

  assert.equal(resolved.name, 'cxj_test_u202606082');

  const summary = buildAuthUserSummary({
    id: 'u_2',
    displayName: 'cxj_test_u202606082',
    email: 'cxj_test_u202606082@chuangxiaoju.com',
    isAdmin: false,
    role: 'user',
    tokenBalance: 2580,
    isVip: true,
  });

  assert.equal(summary.name, 'cxj_test_u202606082');
});

test('email-like names fall back to displayName for summaries and profiles', () => {
  const mapped = buildAuthUserFromProfile(
    {
      id: 'u_3',
      name: 'cxj_test_u202606082@chuangxiaoju.com',
      displayName: 'cxj_test_u202606082',
      email: 'cxj_test_u202606082@chuangxiaoju.com',
      isAdmin: false,
    },
    false,
  );

  assert.equal(mapped.name, 'cxj_test_u202606082');

  const summary = buildAuthUserSummary({
    id: 'u_3',
    name: 'cxj_test_u202606082@chuangxiaoju.com',
    displayName: 'cxj_test_u202606082',
    email: 'cxj_test_u202606082@chuangxiaoju.com',
    isAdmin: false,
    role: 'user',
    tokenBalance: 2580,
    isVip: true,
  });

  assert.equal(summary.name, 'cxj_test_u202606082');
});
