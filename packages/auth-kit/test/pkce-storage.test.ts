import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCallbackBridgeScript, buildPkceAuthorizeBootstrapScript, getPkceStorageKey } from '../src/core/pkce-storage.ts';

test('getPkceStorageKey hashes state into a stable storage key', () => {
  const keyA = getPkceStorageKey('state-a');
  const keyB = getPkceStorageKey('state-a');
  const keyC = getPkceStorageKey('state-b');

  assert.equal(keyA, keyB);
  assert.notEqual(keyA, keyC);
  assert.match(keyA, /^pkce_code_verifier\.[A-Za-z0-9_-]+$/);
});

test('authorize bootstrap script stores verifier in browser storage and appends pkce challenge', () => {
  const script = buildPkceAuthorizeBootstrapScript('http://casdoor.local');

  assert.match(script, /crypto\.subtle\.digest\('SHA-256'/);
  assert.match(script, /sessionStorage\.setItem/);
  assert.match(script, /localStorage\.setItem/);
  assert.match(script, /code_challenge_method/);
  assert.match(script, /window\.location\.replace\(authorizeUrl\.toString\(\)\)/);
  assert.match(script, /split\('\+'\)\.join\('-'\)\.split\('\/'\)\.join\('_'\)\.split\('='\)\.join\(''\)/);
});

test('callback bridge script posts verifier back to the callback endpoint', () => {
  const script = buildCallbackBridgeScript();

  assert.match(script, /function base64UrlFromBinarySource/);
  assert.match(script, /fetch\(window\.location\.pathname/);
  assert.match(script, /method: 'POST'/);
  assert.match(script, /verifier/);
  assert.match(script, /response\.json\(\)/);
  assert.match(script, /window\.location\.replace\(\(payload && payload\.redirectUrl\)/);
});
