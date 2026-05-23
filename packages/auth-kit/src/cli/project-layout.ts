import fs from 'node:fs';
import path from 'node:path';

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

function exists(filePath: string) {
  return fs.existsSync(filePath);
}

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

export function buildManagedRoutePath(appDir: ManagedAppDir, ...segments: string[]): string {
  return path.join(appDir, managedRouteGroup, ...segments);
}

export function buildManagedRouteTargets(appDir: ManagedAppDir) {
  return {
    authConfig: buildManagedRoutePath(appDir, 'auth-config.ts'),
    authLoginRoute: buildManagedRoutePath(appDir, 'auth/login/route.ts'),
    authSignupRoute: buildManagedRoutePath(appDir, 'auth/signup/route.ts'),
    authorizeRoute: buildManagedRoutePath(appDir, 'login/oauth/authorize/route.ts'),
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
    indexHtml: buildManagedRoutePath(appDir, 'index-html.ts'),
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
    'lib/auth-kit/index-html.ts',
    'lib/auth-kit',
    'lib/casdoor-entry.ts',
    'lib/auth.ts',
    'lib/public-origin.ts',
    'lib/request-security.ts',
    'lib/auth-redirect.ts',
  ];

  const currentRouteTargets = Object.values(buildManagedRouteTargets(otherAppDir));
  return [...new Set([...currentRouteTargets, ...appPaths.map((rel) => path.join(otherAppDir, '(auth-kit)', rel)), ...rootPaths])];
}
