import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AUTH_KIT_ENV_FILES, getMissingManagedEnvKeys } from '../core/env';
import { exists, preserveCustomBlock, read, removePath, writeGeneratedFile, writeTextFile } from './fs';
import {
  apiProxyRouteTemplate,
  authConfigTemplate,
  authIndexHtmlTemplate,
  authLoginRouteTemplate,
  authSignupRouteTemplate,
  callbackErrorClearCookiesButtonTemplate,
  callbackErrorPageTemplate,
  authorizeRouteTemplate,
  callbackRouteTemplate,
  billingPaymentFinishedHandlerTemplate,
  billingOrderRedirectTemplate,
  billingPaymentSuccessHandlerTemplate,
  commerceProxyRouteTemplate,
  envTemplate,
  logoutRouteTemplate,
  nextAuthRouteTemplate,
  paymentFinishedRouteTemplate,
  paymentSuccessRouteTemplate,
  prismaSchemaTemplate,
  signupAuthorizeRouteTemplate,
} from './templates';

const projectRoot = process.cwd();
const distRoot = path.dirname(fileURLToPath(import.meta.url));
const canonicalSkillPaths = [
  path.join(distRoot, 'skills/casdoor-next-auth-kit'),
  path.resolve(distRoot, '..', '..', '..', 'skills/casdoor-next-auth-kit'),
];
const skillTarget = '.agents/skills/casdoor-next-auth-kit';

const targets = [
  ['app/(auth-kit)/auth-config.ts', authConfigTemplate],
  ['app/(auth-kit)/auth/login/route.ts', authLoginRouteTemplate],
  ['app/(auth-kit)/auth/signup/route.ts', authSignupRouteTemplate],
  ['app/(auth-kit)/login/oauth/authorize/route.ts', authorizeRouteTemplate],
  ['app/(auth-kit)/signup/oauth/authorize/route.ts', signupAuthorizeRouteTemplate],
  ['app/(auth-kit)/auth/api/[...path]/route.ts', apiProxyRouteTemplate],
  ['app/(auth-kit)/api/auth/[...nextauth]/route.ts', nextAuthRouteTemplate],
  ['app/(auth-kit)/auth/payment/success/route.ts', paymentSuccessRouteTemplate],
  ['app/(auth-kit)/auth/payment/finished/route.ts', paymentFinishedRouteTemplate],
  ['app/(auth-kit)/callback/route.ts', callbackRouteTemplate],
  ['app/(auth-kit)/callback/error/page.tsx', callbackErrorPageTemplate],
  ['app/(auth-kit)/callback/error/clear-domain-cookies-button.tsx', callbackErrorClearCookiesButtonTemplate],
  ['app/(auth-kit)/logout/route.ts', logoutRouteTemplate],
  ['app/(auth-kit)/auth/api/commerce/[...path]/route.ts', commerceProxyRouteTemplate],
  ['lib/billing/payment-success.ts', billingPaymentSuccessHandlerTemplate],
  ['lib/billing/payment-finished.ts', billingPaymentFinishedHandlerTemplate],
  ['lib/billing/order-redirect.ts', billingOrderRedirectTemplate],
  ['app/(auth-kit)/index-html.ts', authIndexHtmlTemplate],
  ['prisma/auth-kit.prisma', prismaSchemaTemplate],
] as const;

const deprecatedTargets = [
  'app/(auth-kit)/api/casdoor/[...path]/route.ts',
  'app/(auth-kit)/api/casdoor/commerce/[...path]/route.ts',
  'app/(auth-kit)/auth/api/casdoor/[...path]/route.ts',
  'app/(auth-kit)/auth/api/casdoor/commerce/[...path]/route.ts',
  'app/(auth-kit)/login/route.ts',
  'app/(auth-kit)/signup/route.ts',
  'app/(auth-kit)/signup/oauth/authorize/route.ts',
  'app/(auth-kit)/auth/payment-success/route.ts',
  'app/(auth-kit)/auth/payment/finished/page.tsx',
  'app/(auth-kit)/callback/error/page.tsx',
  'app/auth/index-html.ts',
  'app/auth/libs/index.ts',
  'app/auth/libs/auth-config.ts',
  'app/auth/libs/casdoor-config.ts',
  'app/auth/libs/session-token.ts',
  'app/auth/libs/oauth-state.ts',
  'app/auth/libs/page-proxy.ts',
  'app/auth/libs/api-proxy.ts',
  'app/auth/libs/casdoor-oauth.ts',
  'app/auth/libs/nextauth-route.ts',
  'app/auth/libs',
  'lib/auth-kit/index.ts',
  'lib/auth-kit/index-html.ts',
  'lib/auth-kit',
  'lib/casdoor-entry.ts',
  'lib/auth.ts',
  'lib/public-origin.ts',
  'lib/request-security.ts',
  'lib/auth-redirect.ts',
] as const;

function logCreated(filePath: string) {
  console.log(`+ ${path.relative(projectRoot, filePath)}`);
}

function logUpdated(filePath: string) {
  console.log(`~ ${path.relative(projectRoot, filePath)}`);
}

function logRemoved(filePath: string) {
  console.log(`- ${path.relative(projectRoot, filePath)}`);
}

function syncManagedEnvFiles() {
  for (const file of AUTH_KIT_ENV_FILES) {
    const filePath = path.join(projectRoot, file);
    const existed = exists(filePath);
    const current = existed ? read(filePath) : '';
    const next = envTemplate(file, current);
    if (!existed || current !== next) {
      writeTextFile(filePath, next);
      if (!existed) {
        logCreated(filePath);
      } else {
        logUpdated(filePath);
      }
    }
  }
}

function syncManagedSkillFile() {
  const filePath = path.join(projectRoot, skillTarget);
  try {
    const sourcePath = canonicalSkillPaths.find((candidate) => fs.existsSync(candidate));
    if (!sourcePath) {
      throw new Error(`Unable to locate canonical skill directory. Checked: ${canonicalSkillPaths.join(', ')}`);
    }
    removePath(filePath);
    fs.mkdirSync(filePath, { recursive: true });
    logCreated(filePath);
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

export async function initProject() {
  for (const [rel, factory] of targets) {
    const filePath = path.join(projectRoot, rel);
    if (!exists(filePath)) {
      writeGeneratedFile(filePath, factory());
      logCreated(filePath);
    }
  }

  syncManagedEnvFiles();
  syncManagedSkillFile();
  console.log('Initialized casdoor-next-auth-kit managed files.');
}

export async function updateProject() {
  for (const rel of deprecatedTargets) {
    const filePath = path.join(projectRoot, rel);
    if (exists(filePath)) {
      removePath(filePath);
      logRemoved(filePath);
    }
  }

  for (const [rel, factory] of targets) {
    const filePath = path.join(projectRoot, rel);
    const next = '// generated by @foldspace-fe/casdoor-next-auth-kit\n' + factory();
    if (!exists(filePath)) {
      writeGeneratedFile(filePath, factory());
      logCreated(filePath);
      continue;
    }

    if (rel === 'app/(auth-kit)/auth-config.ts') {
      const current = read(filePath);
      if (current !== next) {
        writeTextFile(filePath, next);
        logUpdated(filePath);
      }
      continue;
    }

    const current = read(filePath);
    const updated = preserveCustomBlock(current, next);
    if (current !== updated) {
      writeTextFile(filePath, updated);
      logUpdated(filePath);
    }
  }

  syncManagedEnvFiles();
  syncManagedSkillFile();
  console.log('Updated managed route shells, env files, and skill file.');
}

export async function checkProject() {
  const missingRoutes = targets.filter(([rel]) => !exists(path.join(projectRoot, rel))).map(([rel]) => rel);
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
