import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AUTH_KIT_ENV_FILES, getMissingManagedEnvKeys } from '../core/env.ts';
import { exists, preserveCustomBlock, read, removePath, writeGeneratedFile, writeTextFile } from './fs.ts';
import {
  buildDeprecatedManagedProjectTargets,
  buildDeprecatedManagedRouteTargets,
  buildManagedRouteTargets,
  buildManagedProjectTargets,
  resolveManagedAppDir,
  type ManagedAppDir,
} from './project-layout.ts';
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
} from './templates.ts';

const distRoot = path.dirname(fileURLToPath(import.meta.url));
const canonicalSkillPaths = [
  path.join(distRoot, 'skills/casdoor-next-auth-kit'),
  path.resolve(distRoot, '..', '..', '..', 'skills/casdoor-next-auth-kit'),
  path.resolve(distRoot, '..', '..', '..', '..', 'skills/casdoor-next-auth-kit'),
];
const skillTarget = '.agents/skills/casdoor-next-auth-kit';
function buildTargets(appDir: ManagedAppDir) {
  const managed = buildManagedRouteTargets(appDir);
  const managedProject = buildManagedProjectTargets(appDir);
  return [
    [managed.authConfig, authConfigTemplate],
    [managed.authLoginRoute, authLoginRouteTemplate],
    [managed.authSignupRoute, authSignupRouteTemplate],
    [managed.authorizeRoute, authorizeRouteTemplate],
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
    [managedProject.billingPaymentSuccess, billingPaymentSuccessHandlerTemplate],
    [managedProject.billingPaymentFinished, billingPaymentFinishedHandlerTemplate],
    [managedProject.billingOrderRedirect, billingOrderRedirectTemplate],
    [managed.indexHtml, authIndexHtmlTemplate],
    [managedProject.prismaSchema, prismaSchemaTemplate],
  ] as const;
}

function buildDeprecatedTargets(projectRoot: string) {
  const appDir = resolveManagedAppDir(projectRoot);
  return [...buildDeprecatedManagedRouteTargets(appDir), ...buildDeprecatedManagedProjectTargets(appDir)];
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

  for (const rel of buildDeprecatedTargets(projectRoot)) {
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
  const managedProject = buildManagedProjectTargets(appDir);
  const missingProject = Object.values(managedProject)
    .filter((rel) => !exists(path.join(projectRoot, rel)))
    .map((rel) => rel);
  const missing = [...missingRoutes, ...missingProject, ...missingEnv, ...missingSkill];

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
