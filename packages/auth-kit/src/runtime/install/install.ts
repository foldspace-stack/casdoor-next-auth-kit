import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import packageJson from '../../../package.json' with { type: 'json' };
import { AUTH_KIT_ENV_FILES, getMissingManagedEnvKeys } from './env.ts';
import { exists, preserveCustomBlock, read, removePath, writeGeneratedFile, writeTextFile } from './fs.ts';
import {
  apiProxyRouteTemplate,
  authConfigTemplate,
  authLoginRouteTemplate,
  authSignupRouteTemplate,
  authorizeRouteTemplate,
  billingOrderRedirectTemplate,
  billingPaymentFinishedHandlerTemplate,
  billingPaymentSuccessHandlerTemplate,
  callbackErrorClearCookiesButtonTemplate,
  callbackErrorPageTemplate,
  callbackRouteTemplate,
  commerceProxyRouteTemplate,
  envTemplate,
  loginOauthFallbackRouteTemplate,
  logoutRouteTemplate,
  nextAuthRouteTemplate,
  paymentFinishedRouteTemplate,
  paymentSuccessRouteTemplate,
  prismaSchemaTemplate,
  signupAuthorizeRouteTemplate,
  userRecordTemplate,
} from './templates.ts';

export type ManagedAppDir = 'app' | 'src/app';

const managedAppDirCandidates: ManagedAppDir[] = ['src/app', 'app'];
const managedRouteGroup = '(auth-kit)';
const appMarkerFiles = [
  'layout.tsx',
  'layout.ts',
  'layout.jsx',
  'layout.js',
  'page.tsx',
  'page.ts',
  'page.jsx',
  'page.js',
];

const distRoot = path.dirname(fileURLToPath(import.meta.url));
const canonicalSkillPaths = [
  path.join(distRoot, 'skills/casdoor-next-auth-kit'),
  path.resolve(distRoot, '..', '..', '..', 'skills/casdoor-next-auth-kit'),
  path.resolve(distRoot, '..', '..', '..', '..', 'skills/casdoor-next-auth-kit'),
];
const skillTarget = '.agents/skills/casdoor-next-auth-kit';

function getAppMarkerScore(projectRoot: string, appDir: ManagedAppDir): number {
  const appRoot = path.join(projectRoot, appDir);
  let score = 0;
  for (const marker of appMarkerFiles) {
    if (exists(path.join(appRoot, marker))) {
      score += 1;
    }
  }
  return score;
}

function hasManagedRouteShell(projectRoot: string, appDir: ManagedAppDir): boolean {
  return exists(path.join(projectRoot, appDir, managedRouteGroup));
}

export function resolveManagedAppDir(projectRoot = process.cwd()): ManagedAppDir {
  const [srcAppDir, appDir] = managedAppDirCandidates;
  const srcAppExists = exists(path.join(projectRoot, srcAppDir));
  const appExists = exists(path.join(projectRoot, appDir));

  if (srcAppExists && !appExists) {
    return srcAppDir;
  }

  if (appExists && !srcAppExists) {
    return appDir;
  }

  const srcScore = srcAppExists ? getAppMarkerScore(projectRoot, srcAppDir) : 0;
  const appScore = appExists ? getAppMarkerScore(projectRoot, appDir) : 0;

  if (srcScore !== appScore) {
    return srcScore > appScore ? srcAppDir : appDir;
  }

  const srcManaged = hasManagedRouteShell(projectRoot, srcAppDir);
  const appManaged = hasManagedRouteShell(projectRoot, appDir);

  if (srcManaged && !appManaged) {
    return srcAppDir;
  }

  if (appManaged && !srcManaged) {
    return appDir;
  }

  if (srcAppExists) {
    return srcAppDir;
  }

  return appDir;
}

function buildManagedRoutePath(appDir: ManagedAppDir, ...segments: string[]): string {
  return path.join(appDir, managedRouteGroup, ...segments);
}

export function buildManagedRouteTargets(appDir: ManagedAppDir) {
  return {
    authConfig: buildManagedRoutePath(appDir, 'auth-config.ts'),
    authLoginRoute: buildManagedRoutePath(appDir, 'auth/login/route.ts'),
    authSignupRoute: buildManagedRoutePath(appDir, 'auth/signup/route.ts'),
    authorizeRoute: buildManagedRoutePath(appDir, 'login/oauth/authorize/route.ts'),
    loginOauthFallbackRoute: buildManagedRoutePath(appDir, 'login/oauth/[...path]/route.ts'),
    signupAuthorizeRoute: buildManagedRoutePath(appDir, 'signup/oauth/authorize/route.ts'),
    apiRoute: buildManagedRoutePath(appDir, 'auth/api/[...path]/route.ts'),
    nextAuthRoute: buildManagedRoutePath(appDir, 'api/auth/[...nextauth]/route.ts'),
    paymentSuccessRoute: buildManagedRoutePath(appDir, 'auth/payment/success/route.ts'),
    paymentFinishedRoute: buildManagedRoutePath(appDir, 'auth/payment/finished/route.ts'),
    callbackRoute: buildManagedRoutePath(appDir, 'callback/route.ts'),
    callbackErrorPage: buildManagedRoutePath(appDir, 'callback/error/page.tsx'),
    callbackErrorButton: buildManagedRoutePath(appDir, 'callback/error/clear-domain-cookies-button.tsx'),
    logoutRoute: buildManagedRoutePath(appDir, 'logout/route.ts'),
    commerceRoute: buildManagedRoutePath(appDir, 'auth/api/commerce/[...path]/route.ts'),
  };
}

export function buildDeprecatedManagedRouteTargets(appDir: ManagedAppDir) {
  const otherAppDir: ManagedAppDir = appDir === 'app' ? 'src/app' : 'app';
  const appPaths = [
    'api/casdoor/[...path]/route.ts',
    'api/casdoor/commerce/[...path]/route.ts',
    'auth/api/casdoor/[...path]/route.ts',
    'auth/api/casdoor/commerce/[...path]/route.ts',
    'login/route.ts',
    'signup/route.ts',
    'signup/oauth/authorize/route.ts',
    'auth/payment-success/route.ts',
    'auth/payment/finished/page.tsx',
    'callback/error/page.tsx',
    'auth/index-html.ts',
    'auth/libs/index.ts',
    'auth/libs/auth-config.ts',
    'auth/libs/casdoor-config.ts',
    'auth/libs/session-token.ts',
    'auth/libs/oauth-state.ts',
    'auth/libs/page-proxy.ts',
    'auth/libs/api-proxy.ts',
    'auth/libs/casdoor-oauth.ts',
    'auth/libs/nextauth-route.ts',
    'auth/libs',
  ];
  const rootPaths = [
    'lib/auth-kit/index.ts',
    'lib/auth-kit',
    'lib/billing/payment-success.ts',
    'lib/billing/payment-finished.ts',
    'lib/billing/order-redirect.ts',
    'lib/billing',
    'lib/user/record.ts',
    'lib/casdoor-entry.ts',
    'lib/auth.ts',
    'lib/public-origin.ts',
    'lib/request-security.ts',
    'lib/auth-redirect.ts',
    'prisma/auth-kit.prisma',
  ];

  const currentRouteTargets = Object.values(buildManagedRouteTargets(otherAppDir));
  return [...new Set([...currentRouteTargets, ...appPaths.map((rel) => path.join(otherAppDir, '(auth-kit)', rel)), ...rootPaths])];
}

function logCreated(projectRoot: string, filePath: string) {
  console.log(`+ ${path.relative(projectRoot, filePath)}`);
}

function logUpdated(projectRoot: string, filePath: string) {
  console.log(`~ ${path.relative(projectRoot, filePath)}`);
}

function logRemoved(projectRoot: string, filePath: string) {
  console.log(`- ${path.relative(projectRoot, filePath)}`);
}

function buildTargets(appDir: ManagedAppDir) {
  const managed = buildManagedRouteTargets(appDir);
  return [
    [managed.authConfig, authConfigTemplate],
    [managed.authLoginRoute, authLoginRouteTemplate],
    [managed.authSignupRoute, authSignupRouteTemplate],
    [managed.authorizeRoute, authorizeRouteTemplate],
    [managed.loginOauthFallbackRoute, loginOauthFallbackRouteTemplate],
    [managed.signupAuthorizeRoute, signupAuthorizeRouteTemplate],
    [managed.apiRoute, apiProxyRouteTemplate],
    [managed.nextAuthRoute, nextAuthRouteTemplate],
    [managed.paymentSuccessRoute, paymentSuccessRouteTemplate],
    [managed.paymentFinishedRoute, paymentFinishedRouteTemplate],
    [managed.callbackRoute, callbackRouteTemplate],
    [managed.callbackErrorPage, callbackErrorPageTemplate],
    [managed.callbackErrorButton, callbackErrorClearCookiesButtonTemplate],
    [managed.logoutRoute, logoutRouteTemplate],
    [managed.commerceRoute, commerceProxyRouteTemplate],
    [path.join(appDir, '(auth-kit)', 'billing/payment-success.ts'), billingPaymentSuccessHandlerTemplate],
    [path.join(appDir, '(auth-kit)', 'billing/payment-finished.ts'), billingPaymentFinishedHandlerTemplate],
    [path.join(appDir, '(auth-kit)', 'billing/order-redirect.ts'), billingOrderRedirectTemplate],
    [path.join(appDir, '(auth-kit)', 'user-record.ts'), userRecordTemplate],
    [path.join(appDir, '(auth-kit)', 'prisma/auth-kit.prisma'), prismaSchemaTemplate],
  ] as const;
}

function syncManagedEnvFiles(projectRoot: string) {
  for (const file of AUTH_KIT_ENV_FILES) {
    const filePath = path.join(projectRoot, file);
    const existed = exists(filePath);
    const current = existed ? read(filePath) : '';
    const next = envTemplate(file, current);
    if (!existed || current !== next) {
      writeTextFile(filePath, next);
      if (!existed) {
        logCreated(projectRoot, filePath);
      } else {
        logUpdated(projectRoot, filePath);
      }
    }
  }
}

function syncManagedSkillFile(projectRoot: string) {
  const filePath = path.join(projectRoot, skillTarget);
  try {
    const sourcePath = canonicalSkillPaths.find((candidate) => fs.existsSync(candidate));
    if (!sourcePath) {
      throw new Error(`Unable to locate canonical skill directory. Checked: ${canonicalSkillPaths.join(', ')}`);
    }
    removePath(filePath);
    fs.mkdirSync(filePath, { recursive: true });
    logCreated(projectRoot, filePath);
    for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
      const sourceEntry = path.join(sourcePath, entry.name);
      const targetEntry = path.join(filePath, entry.name);
      if (entry.isDirectory()) {
        fs.cpSync(sourceEntry, targetEntry, { recursive: true });
        console.log(`+ ${path.relative(projectRoot, targetEntry)}/`);
        continue;
      }
      fs.copyFileSync(sourceEntry, targetEntry);
      console.log(`+ ${path.relative(projectRoot, targetEntry)}`);
    }
  } catch (error) {
    console.warn(`Skipped skill sync for ${skillTarget}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function initProject(projectRoot = process.cwd()) {
  const appDir = resolveManagedAppDir(projectRoot);
  for (const [rel, factory] of buildTargets(appDir)) {
    const filePath = path.join(projectRoot, rel);
    if (!exists(filePath)) {
      writeGeneratedFile(filePath, factory());
      logCreated(projectRoot, filePath);
    }
  }

  syncManagedEnvFiles(projectRoot);
  syncManagedSkillFile(projectRoot);
  console.log('Initialized casdoor-next-auth-kit managed files.');
}

export async function updateProject(projectRoot = process.cwd()) {
  const appDir = resolveManagedAppDir(projectRoot);
  const managed = buildManagedRouteTargets(appDir);
  const targets = buildTargets(appDir);

  for (const rel of buildDeprecatedManagedRouteTargets(appDir)) {
    const filePath = path.join(projectRoot, rel);
    if (exists(filePath)) {
      removePath(filePath);
      logRemoved(projectRoot, filePath);
    }
  }

  for (const [rel, factory] of targets) {
    const filePath = path.join(projectRoot, rel);
    const next = '// generated by @foldspace-fe/casdoor-next-auth-kit\n' + factory();
    if (!exists(filePath)) {
      writeGeneratedFile(filePath, factory());
      logCreated(projectRoot, filePath);
      continue;
    }

    if (rel === managed.authConfig) {
      const current = read(filePath);
      if (current !== next) {
        writeTextFile(filePath, next);
        logUpdated(projectRoot, filePath);
      }
      continue;
    }

    const current = read(filePath);
    const updated = preserveCustomBlock(current, next);
    if (current !== updated) {
      writeTextFile(filePath, updated);
      logUpdated(projectRoot, filePath);
    }
  }

  syncManagedEnvFiles(projectRoot);
  syncManagedSkillFile(projectRoot);
  console.log('Updated managed route shells, env files, and skill file.');
}

export async function checkProject(projectRoot = process.cwd()) {
  const appDir = resolveManagedAppDir(projectRoot);
  const missingRoutes = buildTargets(appDir)
    .filter(([rel]) => !exists(path.join(projectRoot, rel)))
    .map(([rel]) => rel);
  const missingEnv = AUTH_KIT_ENV_FILES.filter((file) => {
    const filePath = path.join(projectRoot, file);
    if (!exists(filePath)) {
      return true;
    }
    return getMissingManagedEnvKeys(read(filePath)).length > 0;
  });
  const skillDir = path.join(projectRoot, skillTarget);
  const missingSkill = exists(path.join(skillDir, 'SKILL.md')) ? [] : [path.join(skillTarget, 'SKILL.md')];
  const missing = [...missingRoutes, ...missingEnv, ...missingSkill];

  if (missing.length > 0) {
    console.error('Missing generated files:');
    for (const rel of missing) {
      console.error('- ' + rel);
    }
    process.exitCode = 1;
    return;
  }

  console.log('All managed files are present.');
}

function printUsage() {
  console.log('Usage: npx @foldspace-fe/casdoor-next-auth-kit@latest <init|update|check>');
  console.log('       npx @foldspace-fe/casdoor-next-auth-kit@latest --help');
  console.log('       npx @foldspace-fe/casdoor-next-auth-kit@latest --version');
}

export async function runCli(argv: string[]) {
  const command = argv[0] ?? 'help';
  if (command === '--help' || command === '-h' || command === 'help') {
    printUsage();
    return;
  }
  if (command === '--version' || command === '-v') {
    console.log(packageJson.version);
    return;
  }
  if (command === 'init') return initProject();
  if (command === 'update') return updateProject();
  if (command === 'check') return checkProject();
  printUsage();
}
