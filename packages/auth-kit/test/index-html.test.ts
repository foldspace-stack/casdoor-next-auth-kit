import assert from 'node:assert/strict';
import test from 'node:test';

import { createAuthIndexHtml } from '../src/core/index-html.ts';
import { buildManagedEnvTemplate } from '../src/core/env.ts';

test('createAuthIndexHtml reads DEFAULT_CASDOOR defaults when options are omitted', () => {
  const previousAppName = process.env.DEFAULT_CASDOOR_APP_NAME;
  const previousDescription = process.env.DEFAULT_CASDOOR_DESCRIPTION;
  const previousPoweredByHtml = process.env.DEFAULT_CASDOOR_POWERED_BY_HTML;
  process.env.DEFAULT_CASDOOR_APP_NAME = 'Env Demo App';
  process.env.DEFAULT_CASDOOR_DESCRIPTION = 'Env Demo Description';
  process.env.DEFAULT_CASDOOR_POWERED_BY_HTML = '<span>Powered by Env Footer</span>';

  try {
    const html = createAuthIndexHtml();
    assert.match(html, /Env Demo App/);
    assert.match(html, /Env Demo Description/);
    assert.match(html, /\/casdoor_favicon\.ico/);
    assert.match(html, /Powered by Env Footer/);
    assert.match(html, /window\.DEFAULT_CASDOOR_POWERED_BY_HTML = "<span>Powered by Env Footer<\/span>"/);
    assert.match(html, /function getNormalizedPoweredByHtml\(\)/);
    assert.match(html, /document\.createElement\('template'\)/);
    assert.match(html, /template\.innerHTML = poweredByHtml/);
    assert.match(html, /data-casdoor-powered-by-html/);
    assert.match(html, /getElementById\('footer'\)/);
    assert.match(html, /function isPoweredByFooterCurrent\(footer\)/);
    assert.match(html, /footer\.innerHTML === getNormalizedPoweredByHtml\(\)/);
    assert.match(html, /function writePoweredByFooter\(footer\)/);
    assert.match(html, /footer\.innerHTML = poweredByHtml/);
    assert.match(html, /footer\.setAttribute\('data-casdoor-powered-by-html', '1'\)/);
    assert.match(html, /function watchPoweredByFooter\(\)/);
    assert.match(html, /var watchedFooter = null/);
    assert.match(html, /var footerPoll = null/);
    assert.match(html, /window\.MutationObserver && footer !== watchedFooter/);
    assert.match(html, /watchedFooter = footer/);
    assert.match(html, /footerObserver\.observe\(footer, \{ childList: true, subtree: true, characterData: true \}\)/);
    assert.match(html, /documentObserver\.observe\(document\.documentElement, \{ childList: true, subtree: true \}\)/);
    assert.match(html, /window\.setInterval\(function \(\) \{/);
    assert.match(html, /}, 500\)/);
    assert.doesNotMatch(html, /documentObserver\.disconnect\(\)/);
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

test('createAuthIndexHtml rewrites result urls back to home', () => {
  const html = createAuthIndexHtml();

  assert.match(html, /function watchCurrentLocation\(\)/);
  assert.match(html, /window\.history\.pushState/);
  assert.match(html, /window\.history\.replaceState/);
  assert.match(html, /pathname === '\/result'/);
  assert.match(html, /pathname\.indexOf\('\/result\/'\) === 0/);
  assert.match(html, /function isHomePath\(pathname\)/);
  assert.match(html, /return pathname === '\/'/);
  assert.match(html, /function navigateDocument\(url\)/);
  assert.match(html, /window\.location\.href = url/);
  assert.match(html, /window\.setTimeout\(function \(\) \{/);
  assert.match(html, /window\.location\.assign\(url\)/);
  assert.match(html, /function reloadHomeDocument\(\)/);
  assert.match(html, /var homeUrl = currentOrigin \+ '\/'/);
  assert.match(html, /window\.location\.reload\(\)/);
  assert.match(html, /Casdoor 注册成功后可能只用 history\.pushState/);
  assert.match(html, /当前仍是 auth 壳文档/);
  assert.match(html, /function redirectToHomeRoute\(\)/);
  assert.match(html, /reloadHomeDocument\(\)/);
  assert.match(html, /return currentOrigin \+ '\/'/);
  assert.doesNotMatch(html, /\/auth\/login\?redirect=%2F/);
});

test('createAuthIndexHtml reloads SPA auth entry routes through Next route handlers', () => {
  const html = createAuthIndexHtml();

  assert.match(html, /function isAuthEntryPath\(pathname\)/);
  assert.match(html, /pathname === '\/auth\/login'/);
  assert.match(html, /pathname === '\/auth\/signup'/);
  assert.match(html, /function isBrokenLoginOauthPath\(pathname\)/);
  assert.match(html, /pathname\.indexOf\('\/login\/oauth\/'\) === 0/);
  assert.match(html, /pathname !== '\/login\/oauth\/authorize'/);
  assert.match(html, /function getCurrentAuthEntryRedirectTarget\(\)/);
  assert.match(html, /function getCurrentDocumentUrl\(\)/);
  assert.match(html, /currentUrl\.searchParams\.get\('redirect'\)/);
  assert.match(html, /currentUrl\.searchParams\.get\('returnTo'\)/);
  assert.match(html, /Casdoor's SPA can push \/auth\/login\?redirect=\.\.\. without a document request/);
  assert.match(html, /Next route handler performs the redirect/);
  assert.match(html, /isBrokenLoginOauthPath\(window\.location\.pathname\)/);
  assert.match(html, /navigateDocument\(getCurrentDocumentUrl\(\)\)/);
  assert.match(html, /navigateDocument\(currentOrigin \+ '\/user\/account'\)/);
});

test('createAuthIndexHtml does not pass undefined history URLs to native history APIs', () => {
  const html = createAuthIndexHtml();

  assert.match(html, /function applyPatchedHistoryState\(originalHistoryState, context, args\)/);
  assert.match(html, /Array\.prototype\.slice\.call\(args\)/);
  assert.match(html, /typeof nextArgs\[2\] === 'undefined' \|\| nextArgs\[2\] === null/);
  assert.match(html, /导致 \/login\/oauth\/undefined/);
  assert.match(html, /nextArgs = nextArgs\.slice\(0, 2\)/);
  assert.match(html, /nextArgs\[2\] = toProxyUrl\(nextArgs\[2\]\)/);
  assert.match(html, /applyPatchedHistoryState\(originalHistoryReplaceState, this, arguments\)/);
  assert.match(html, /applyPatchedHistoryState\(originalHistoryPushState, this, arguments\)/);
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
