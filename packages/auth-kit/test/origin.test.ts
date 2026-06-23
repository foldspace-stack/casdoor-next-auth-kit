import assert from 'node:assert/strict';
import test from 'node:test';

import { getRequestOrigin as getCoreRequestOrigin } from '../src/core/origin.ts';
import { getRequestOrigin as getPublicRequestOrigin } from '../src/core/public-origin.ts';

test('request origin prefers browser headers over APP_URL fallback', () => {
  const request = new Request('http://internal.local/login/oauth/authorize', {
    headers: {
      origin: 'https://tenant-a.example.com',
      referer: 'https://tenant-a.example.com/auth/login',
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'tenant-a.example.com',
    },
  });

  assert.equal(getCoreRequestOrigin(request, 'https://configured.example.com'), 'https://tenant-a.example.com');
  assert.equal(getPublicRequestOrigin(request, 'https://configured.example.com'), 'https://tenant-a.example.com');
});

test('request origin falls back to APP_URL when request headers are unavailable', () => {
  const request = new Request('http://internal.local/login/oauth/authorize');

  assert.equal(getCoreRequestOrigin(request, 'https://configured.example.com'), 'https://configured.example.com');
  assert.equal(getPublicRequestOrigin(request, 'https://configured.example.com'), 'https://configured.example.com');
});

test('public origin ignores container auth_origin cookies that point to 0.0.0.0', () => {
  const request = new Request('http://internal.local/callback', {
    headers: {
      cookie: 'auth_origin=http%3A%2F%2F0.0.0.0%3A7273',
    },
  });

  assert.equal(getPublicRequestOrigin(request, 'https://configured.example.com'), 'https://configured.example.com');
});
