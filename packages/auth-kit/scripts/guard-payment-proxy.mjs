import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

function read(relativePath) {
  return readFileSync(resolve(packageRoot, relativePath), 'utf8');
}

function assertRule(condition, message) {
  if (!condition) {
    throw new Error(`payment proxy guard failed: ${message}`);
  }
}

const proxySource = read('src/casdoor/proxy.ts');
const proxyHeadersSource = read('src/casdoor/proxy-headers.ts');
const skillSource = read('../../skills/casdoor-next-auth-kit/SKILL.md');

assertRule(
  !proxySource.includes('RAW_COOKIE_FORWARD_PATHS') && !proxySource.includes('shouldForwardRawCookies'),
  'do not reintroduce raw cookie forwarding paths; payment APIs must use the default Casdoor cookie whitelist',
);

assertRule(
  proxySource.includes('buildCasdoorReferer') &&
    proxySource.includes('/products/') &&
    proxySource.includes('/payments/') &&
    proxySource.includes('/qrcode/') &&
    proxySource.includes("headers.set('referer', buildCasdoorReferer(request, localPrefix, casdoorOrigin))"),
  'payment APIs must keep Casdoor-origin referer mapping for products, payments, and qrcode pages',
);

assertRule(
  proxySource.includes("headers.set('origin', casdoorOrigin)") &&
    proxySource.includes('new URL(config.casdoor.serverUrl).origin'),
  'upstream requests must derive origin from the configured Casdoor server URL',
);

const cookiePatternBlock = proxyHeadersSource.match(/const CASDOOR_COOKIE_NAME_PATTERNS = \[([\s\S]*?)\];/)?.[1] || '';
assertRule(cookiePatternBlock.includes('casdoor_session_id'), 'casdoor_session_id must stay in the cookie whitelist');
assertRule(cookiePatternBlock.includes('casdoor_access_token'), 'casdoor_access_token must stay in the cookie whitelist');
const cookiePatternRules = cookiePatternBlock
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.startsWith('/^'))
  .join('\n');
assertRule(
  !cookiePatternRules.includes('next-auth') && !cookiePatternRules.includes('__Secure-next-auth'),
  'NextAuth cookies must not be added to the default Casdoor cookie whitelist',
);

assertRule(
  proxyHeadersSource.includes('支付 / buy-product 路径不要使用这个选项') &&
    proxyHeadersSource.includes('当前 createCasdoorApiProxyHandler 不应为支付路径打开 includeAllCookies'),
  'includeAllCookies must remain documented as forbidden for payment APIs',
);

assertRule(
  skillSource.includes('支付相关请求必须保持“浏览器只访问宿主同域 `/auth/api/*`') &&
    skillSource.includes('只能携带 Casdoor 最小会话 cookie') &&
    skillSource.includes('生产 Casdoor 是 HTTPS 时必须写 `https://...`') &&
    skillSource.includes('支付 checkout 的请求形态要贴近 Casdoor 原站'),
  'skill docs must keep the payment proxy guardrail section',
);

console.log('payment proxy guard passed');
