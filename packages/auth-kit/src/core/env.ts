import type { ManagedEnvFile, ManagedEnvVariableDefinition } from '../types';

export const AUTH_KIT_ENV_FILES: ManagedEnvFile[] = ['.env', '.env.local', '.env.production', '.env.example'];

export const AUTH_KIT_ENV_VARIABLES: ManagedEnvVariableDefinition[] = [
  {
    key: 'APP_URL',
    description: '站点对外公开地址',
    example: 'https://your-domain.com',
    local: 'http://localhost:5177',
    production: 'https://your-domain.com',
  },
  {
    key: 'NEXTAUTH_URL',
    description: 'NextAuth 回调地址',
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
    example: 'https://auth.example.com',
    local: 'https://auth.example.com',
    production: 'https://auth.example.com',
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
    key: 'NEXT_PUBLIC_CASDOOR_STATIC_ORIGIN',
    description: 'Casdoor 静态资源 origin',
    example: 'https://casdoor-static.foldspace.cn',
    local: 'https://casdoor-static.foldspace.cn',
    production: 'https://casdoor-static.foldspace.cn',
  },
  {
    key: 'CASDOOR_CLIENT_SECRET',
    description: 'Casdoor client secret',
    example: 'your-casdoor-client-secret',
    local: 'your-casdoor-client-secret',
    production: 'your-casdoor-client-secret',
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
