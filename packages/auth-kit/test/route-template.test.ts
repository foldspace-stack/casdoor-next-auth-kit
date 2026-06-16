import assert from 'node:assert/strict';
import test from 'node:test';

import {
  authLoginRouteTemplate,
  authSignupRouteTemplate,
  authorizeRouteTemplate,
  callbackRouteTemplate,
  signupAuthorizeRouteTemplate,
} from '../src/cli/templates.ts';

test('generated auth route templates keep login and signup GET handlers', () => {
  const login = authLoginRouteTemplate();
  const signup = authSignupRouteTemplate();
  const authorize = authorizeRouteTemplate();
  const signupAuthorize = signupAuthorizeRouteTemplate();

  assert.match(login, /export const GET = loginHandler;/);
  assert.match(signup, /export const GET = signupHandler;/);
  assert.match(authorize, /export const GET = authorizeHandler;/);
  assert.match(signupAuthorize, /export const GET = authorizeHandler;/);
});

test('generated callback route template exposes both GET and POST handlers', () => {
  const callback = callbackRouteTemplate();

  assert.match(callback, /export const GET = callbackHandler;/);
  assert.match(callback, /export const POST = callbackHandler;/);
});
