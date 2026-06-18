import assert from 'node:assert/strict';
import test from 'node:test';

import { createAuthIndexHtml } from '../src/core/index-html.ts';
import { buildManagedEnvTemplate } from '../src/core/env.ts';

test('createAuthIndexHtml reads DEFAULT_CASDOOR defaults when options are omitted', () => {
  const previousAppName = process.env.DEFAULT_CASDOOR_APP_NAME;
  const previousDescription = process.env.DEFAULT_CASDOOR_DESCRIPTION;
  const previousIconHref = process.env.DEFAULT_CASDOOR_ICON_HREF;
  const previousPoweredByHtml = process.env.DEFAULT_CASDOOR_POWERED_BY_HTML;
  process.env.DEFAULT_CASDOOR_APP_NAME = 'Env Demo App';
  process.env.DEFAULT_CASDOOR_DESCRIPTION = 'Env Demo Description';
  process.env.DEFAULT_CASDOOR_ICON_HREF = 'https://example.com/custom-icon.png';
  process.env.DEFAULT_CASDOOR_POWERED_BY_HTML = '<span>Powered by Env Footer</span>';

  try {
    const html = createAuthIndexHtml();
    assert.match(html, /Env Demo App/);
    assert.match(html, /Env Demo Description/);
    assert.match(html, /https:\/\/example\.com\/custom-icon\.png/);
    assert.match(html, /Powered by Env Footer/);
    assert.doesNotMatch(html, /https:\/\/cdn\.casbin\.org\/img\/favicon\.png/);
  } finally {
    if (previousAppName === undefined) {
      delete process.env.DEFAULT_CASDOOR_APP_NAME;
    } else {
      process.env.DEFAULT_CASDOOR_APP_NAME = previousAppName;
    }
    if (previousDescription === undefined) {
      delete process.env.DEFAULT_CASDOOR_DESCRIPTION;
    } else {
      process.env.DEFAULT_CASDOOR_DESCRIPTION = previousDescription;
    }
    if (previousIconHref === undefined) {
      delete process.env.DEFAULT_CASDOOR_ICON_HREF;
    } else {
      process.env.DEFAULT_CASDOOR_ICON_HREF = previousIconHref;
    }
    if (previousPoweredByHtml === undefined) {
      delete process.env.DEFAULT_CASDOOR_POWERED_BY_HTML;
    } else {
      process.env.DEFAULT_CASDOOR_POWERED_BY_HTML = previousPoweredByHtml;
    }
  }
});

test('managed env template includes index-html default overrides', () => {
  const template = buildManagedEnvTemplate('.env.example', '');

  assert.match(template, /DEFAULT_CASDOOR_APP_NAME=/);
  assert.match(template, /DEFAULT_CASDOOR_DESCRIPTION=/);
  assert.match(template, /DEFAULT_CASDOOR_ICON_HREF=/);
  assert.match(template, /DEFAULT_CASDOOR_POWERED_BY_HTML=/);
});

test('createAuthIndexHtml rewrites result urls back to the login entry', () => {
  const html = createAuthIndexHtml();

  assert.match(html, /function watchCurrentLocation\(\)/);
  assert.match(html, /window\.history\.pushState/);
  assert.match(html, /window\.history\.replaceState/);
  assert.match(html, /pathname === '\/result'/);
  assert.match(html, /pathname\.indexOf\('\/result\/'\) === 0/);
  assert.match(html, /\/auth\/login\?redirect=%2F/);
});

test('createAuthIndexHtml injects browser pkce bootstrap logic for authorize pages', () => {
  const html = createAuthIndexHtml();

  assert.match(html, /buildStorageKey/);
  assert.match(html, /crypto\.subtle\.digest\('SHA-256'/);
  assert.match(html, /sessionStorage\.setItem/);
  assert.match(html, /localStorage\.setItem/);
  assert.match(html, /code_challenge_method/);
  assert.match(html, /window\.location\.replace\(authorizeUrl\.toString\(\)\)/);
  assert.match(html, /pkce_code_verifier/);
});
