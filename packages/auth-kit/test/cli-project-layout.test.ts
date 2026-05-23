import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import test from 'node:test';

import {
  buildDeprecatedManagedRouteTargets,
  buildManagedRouteTargets,
  buildManagedProjectTargets,
  resolveManagedAppDir,
} from '../src/cli/project-layout.ts';
import { initProject, updateProject } from '../src/cli/operations.ts';

async function withTempDir(run: (dir: string) => void | Promise<void>) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'casdoor-next-auth-kit-'));
  try {
    await run(tempDir);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

test('resolves src/app when the project uses src/app', () => {
  return withTempDir((dir) => {
    fs.mkdirSync(path.join(dir, 'src/app'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src/app/layout.tsx'), 'export default function Layout() { return null; }');

    assert.equal(resolveManagedAppDir(dir), 'src/app');
  });
});

test('resolves app when the project uses app', () => {
  return withTempDir((dir) => {
    fs.mkdirSync(path.join(dir, 'app'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'app/layout.tsx'), 'export default function Layout() { return null; }');

    assert.equal(resolveManagedAppDir(dir), 'app');
  });
});

test('builds managed route targets under the chosen app root', () => {
  const targets = buildManagedRouteTargets('src/app');
  assert.equal(targets.authConfig, path.join('src/app', '(auth-kit)', 'auth-config.ts'));
  assert.equal(targets.callbackErrorButton, path.join('src/app', '(auth-kit)', 'callback/error/clear-domain-cookies-button.tsx'));
});

test('builds managed project targets under src for src/app projects', () => {
  const targets = buildManagedProjectTargets('src/app');
  assert.equal(targets.billingPaymentSuccess, path.join('src', 'lib/billing/payment-success.ts'));
  assert.equal(targets.billingPaymentFinished, path.join('src', 'lib/billing/payment-finished.ts'));
  assert.equal(targets.billingOrderRedirect, path.join('src', 'lib/billing/order-redirect.ts'));
  assert.equal(targets.prismaSchema, path.join('src', 'prisma/auth-kit.prisma'));
});

test('builds managed project targets at project root for app projects', () => {
  const targets = buildManagedProjectTargets('app');
  assert.equal(targets.billingPaymentSuccess, path.join('lib/billing/payment-success.ts'));
  assert.equal(targets.billingPaymentFinished, path.join('lib/billing/payment-finished.ts'));
  assert.equal(targets.billingOrderRedirect, path.join('lib/billing/order-redirect.ts'));
  assert.equal(targets.prismaSchema, path.join('prisma/auth-kit.prisma'));
});

test('deprecations cover both app roots', () => {
  const appTargets = buildDeprecatedManagedRouteTargets('app');
  const srcAppTargets = buildDeprecatedManagedRouteTargets('src/app');

  assert.ok(appTargets.includes(path.join('src/app', '(auth-kit)', 'login/route.ts')));
  assert.ok(appTargets.includes(path.join('src/app', '(auth-kit)', 'auth/index-html.ts')));
  assert.ok(srcAppTargets.includes(path.join('app', '(auth-kit)', 'login/route.ts')));
  assert.ok(srcAppTargets.includes(path.join('app', '(auth-kit)', 'auth/index-html.ts')));
});

test('initProject writes managed files under src/app when src/app exists', async () => {
  await withTempDir(async (dir) => {
    fs.mkdirSync(path.join(dir, 'src/app'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src/app/layout.tsx'), 'export default function Layout() { return null; }');

    await initProject(dir);

    assert.ok(fs.existsSync(path.join(dir, 'src/app/(auth-kit)/auth-config.ts')));
    assert.ok(!fs.existsSync(path.join(dir, 'app/(auth-kit)/auth-config.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'src/lib/billing/payment-success.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'src/lib/billing/payment-finished.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'src/lib/billing/order-redirect.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'src/prisma/auth-kit.prisma')));
    assert.ok(!fs.existsSync(path.join(dir, 'lib/billing/payment-success.ts')));
    assert.ok(!fs.existsSync(path.join(dir, 'prisma/auth-kit.prisma')));
  });
});

test('initProject writes managed files under app when app exists', async () => {
  await withTempDir(async (dir) => {
    fs.mkdirSync(path.join(dir, 'app'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'app/layout.tsx'), 'export default function Layout() { return null; }');

    await initProject(dir);

    assert.ok(fs.existsSync(path.join(dir, 'app/(auth-kit)/auth-config.ts')));
    assert.ok(!fs.existsSync(path.join(dir, 'src/app/(auth-kit)/auth-config.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'lib/billing/payment-success.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'lib/billing/payment-finished.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'lib/billing/order-redirect.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'prisma/auth-kit.prisma')));
    assert.ok(!fs.existsSync(path.join(dir, 'src/lib/billing/payment-success.ts')));
    assert.ok(!fs.existsSync(path.join(dir, 'src/prisma/auth-kit.prisma')));
  });
});

test('updateProject removes stale src/app files when app is the active root', async () => {
  await withTempDir(async (dir) => {
    fs.mkdirSync(path.join(dir, 'app'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'app/layout.tsx'), 'export default function Layout() { return null; }');
    fs.mkdirSync(path.join(dir, 'src/app/(auth-kit)'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src/app/(auth-kit)/auth-config.ts'), '// stale');

    await updateProject(dir);

    assert.ok(fs.existsSync(path.join(dir, 'app/(auth-kit)/auth-config.ts')));
    assert.ok(!fs.existsSync(path.join(dir, 'src/app/(auth-kit)/auth-config.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'lib/billing/payment-success.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'lib/billing/payment-finished.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'lib/billing/order-redirect.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'prisma/auth-kit.prisma')));
    assert.ok(!fs.existsSync(path.join(dir, 'src/lib/billing/payment-success.ts')));
    assert.ok(!fs.existsSync(path.join(dir, 'src/prisma/auth-kit.prisma')));
  });
});

test('updateProject removes stale app files when src/app is the active root', async () => {
  await withTempDir(async (dir) => {
    fs.mkdirSync(path.join(dir, 'src/app'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src/app/layout.tsx'), 'export default function Layout() { return null; }');
    fs.mkdirSync(path.join(dir, 'app/(auth-kit)'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'app/(auth-kit)/auth-config.ts'), '// stale');

    await updateProject(dir);

    assert.ok(fs.existsSync(path.join(dir, 'src/app/(auth-kit)/auth-config.ts')));
    assert.ok(!fs.existsSync(path.join(dir, 'app/(auth-kit)/auth-config.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'src/lib/billing/payment-success.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'src/lib/billing/payment-finished.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'src/lib/billing/order-redirect.ts')));
    assert.ok(fs.existsSync(path.join(dir, 'src/prisma/auth-kit.prisma')));
    assert.ok(!fs.existsSync(path.join(dir, 'lib/billing/payment-success.ts')));
    assert.ok(!fs.existsSync(path.join(dir, 'prisma/auth-kit.prisma')));
  });
});
