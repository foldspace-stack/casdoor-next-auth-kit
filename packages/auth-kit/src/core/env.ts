import type { ManagedEnvFile, ManagedEnvVariableDefinition } from '../types';

export const AUTH_KIT_ENV_FILES: ManagedEnvFile[] = ['.env', '.env.local', '.env.production', '.env.example'];

export const AUTH_KIT_ENV_VARIABLES: ManagedEnvVariableDefinition[] = [
  {
    key: 'APP_URL',
    description: '站点对外公开地址（可留空，作为 request origin 的最后兜底）',
    example: 'https://your-domain.com',
    local: 'http://localhost:5177',
    production: 'https://your-domain.com',
  },
  {
    key: 'NEXTAUTH_URL',
    description: 'NextAuth 回调地址（可留空，作为 request origin 的最后兜底）',
    example: 'http://localhost:5177',
    local: 'http://localhost:5177',
    production: 'https://your-domain.com',
  },
  {
    key: 'NEXTAUTH_SECRET',
    description: 'NextAuth JWT secret',
    example: 'replace-with-a-random-secret',
    local: 'replace-with-a-random-secret',
    production: 'replace-with-a-random-secret',
  },
  {
    key: 'GLOBAL_ADMIN_EMAILS',
    description: '全局管理员邮箱，逗号分隔',
    example: 'admin@example.com',
    local: 'admin@example.com',
    production: 'admin@example.com',
  },
  {
    key: 'AUTH_DEBUG',
    description: '是否开启认证调试日志',
    example: 'false',
    local: 'false',
    production: 'false',
  },
  {
    key: 'NEXT_PUBLIC_CASDOOR_SERVER_URL',
    description: 'Casdoor 服务地址',
    example: 'https://casdoor.example.com',
    local: 'https://casdoor.example.com',
    production: 'https://casdoor.example.com',
  },
  {
    key: 'NEXT_PUBLIC_CASDOOR_CLIENT_ID',
    description: 'Casdoor client id',
    example: 'your-casdoor-client-id',
    local: 'your-casdoor-client-id',
    production: 'your-casdoor-client-id',
  },
  {
    key: 'NEXT_PUBLIC_CASDOOR_APP_NAME',
    description: 'Casdoor app name',
    example: 'your-app-name',
    local: 'your-app-name',
    production: 'your-app-name',
  },
  {
    key: 'DEFAULT_CASDOOR_APP_NAME',
    description: 'index-html 默认 app name',
    example: '创小剧 AI',
    local: '创小剧 AI',
    production: '创小剧 AI',
  },
  {
    key: 'DEFAULT_CASDOOR_DESCRIPTION',
    description: 'index-html 默认 description',
    example: '创小剧 AI 登录 - 一个支持 OAuth 2.0、OIDC、SAML 和 CAS 的身份与单点登录平台',
    local: '创小剧 AI 登录 - 一个支持 OAuth 2.0、OIDC、SAML 和 CAS 的身份与单点登录平台',
    production: '创小剧 AI 登录 - 一个支持 OAuth 2.0、OIDC、SAML 和 CAS 的身份与单点登录平台',
  },
  {
    key: 'DEFAULT_CASDOOR_ICON_HREF',
    description: 'index-html 默认 icon 地址',
    example: 'https://cdn.casbin.org/img/favicon.png',
    local: 'https://cdn.casbin.org/img/favicon.png',
    production: 'https://cdn.casbin.org/img/favicon.png',
  },
  {
    key: 'NEXT_PUBLIC_CASDOOR_ORGANIZATION_NAME',
    description: 'Casdoor organization name',
    example: 'your-org-name',
    local: 'your-org-name',
    production: 'your-org-name',
  },
  {
    key: 'NEXT_PUBLIC_CASDOOR_REDIRECT_PATH',
    description: 'Casdoor OAuth 回调路径',
    example: '/callback',
    local: '/callback',
    production: '/callback',
  },
  {
    key: 'NEXT_PUBLIC_CASDOOR_SIGNIN_PATH',
    description: 'Casdoor authorize 路径',
    example: '/login/oauth/authorize',
    local: '/login/oauth/authorize',
    production: '/login/oauth/authorize',
  },
  {
    key: 'NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT_PATH',
    description: '注销后跳转路径，默认首页',
    example: '/',
    local: '/',
    production: '/',
  },
  {
    key: 'NEXT_PUBLIC_BILLING_PURCHASABLE_IDS',
    description: 'Billing 可购买项白名单，逗号分隔',
    example: 'membership-monthly,credits-50',
    local: 'membership-monthly,credits-50',
    production: 'membership-monthly,credits-50',
  },
  {
    key: 'NEXT_PUBLIC_CASDOOR_STATIC_ORIGIN',
    description: 'Casdoor 静态资源 origin',
    example: 'https://static.example.com',
    local: 'https://static.example.com',
    production: 'https://static.example.com',
  },
  {
    key: 'CASDOOR_CLIENT_SECRET',
    description: 'Casdoor client secret',
    example: 'your-casdoor-client-secret',
    local: 'your-casdoor-client-secret',
    production: 'your-casdoor-client-secret',
  },
  {
    key: 'BILLING_PAYMENT_SUCCESS_DEBUG',
    description: '是否打印 payment-success 调试日志',
    example: 'false',
    local: 'false',
    production: 'false',
  },
];

function stringifyEnvValue(value: string): string {
  if (value === '') {
    return '""';
  }

  if (/^[A-Za-z0-9_./:-]+$/.test(value)) {
    return value;
  }

  return JSON.stringify(value);
}

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseEnvKeys(content: string): Set<string> {
  const keys = new Set<string>();
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    if (key) {
      keys.add(key);
    }
  }
  return keys;
}

export function readManagedEnvValue(content: string, key: string): string | null {
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const currentKey = trimmed.slice(0, separatorIndex).trim();
    if (currentKey !== key) {
      continue;
    }

    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    return stripQuotes(rawValue);
  }

  return null;
}

export function getManagedEnvValue(definition: ManagedEnvVariableDefinition, file: ManagedEnvFile): string {
  if (file === '.env.example') {
    return definition.example;
  }
  if (file === '.env.production') {
    return definition.production ?? definition.example;
  }
  if (file === '.env.local') {
    return definition.local ?? definition.example;
  }
  return definition.base ?? definition.local ?? definition.production ?? definition.example;
}

export function buildManagedEnvTemplate(file: ManagedEnvFile, existingContent = ''): string {
  const existingKeys = parseEnvKeys(existingContent);
  const lines: string[] = existingContent.trimEnd() ? existingContent.trimEnd().split(/\r?\n/) : [];
  const missing = AUTH_KIT_ENV_VARIABLES.filter((definition) => !existingKeys.has(definition.key));

  if (missing.length === 0 && existingContent) {
    return existingContent;
  }

  if (lines.length > 0) {
    lines.push('');
  }

  lines.push(`# Casdoor Next Auth Kit managed values for ${file}`);
  for (const definition of missing) {
    const value = getManagedEnvValue(definition, file);
    lines.push(`# ${definition.description}`);
    lines.push(`${definition.key}=${stringifyEnvValue(value)}`);
    lines.push('');
  }

  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  return `${lines.join('\n')}\n`;
}

export function getMissingManagedEnvKeys(content: string): string[] {
  const existingKeys = parseEnvKeys(content);
  return AUTH_KIT_ENV_VARIABLES.filter((definition) => !existingKeys.has(definition.key)).map(
    (definition) => definition.key,
  );
}

export function sanitizeExistingEnvContent(content: string): string {
  return stripQuotes(content);
}
