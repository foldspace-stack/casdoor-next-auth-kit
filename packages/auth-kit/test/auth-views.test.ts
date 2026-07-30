import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AccountView, AuthDocument, LoginView, SignupView, buildAuthThemeStyle } from '../dist/auth/index.js';

test('auth theme exposes shadcn-compatible CSS variables', () => {
  const style = buildAuthThemeStyle({
    primary: '#111827',
    accent: 'rgba(99, 102, 241, 0.14)',
    pageBackdrop: 'linear-gradient(180deg, #fff 0%, #eef2ff 100%)',
  }) as Record<string, string>;

  assert.equal(style['--primary'], '#111827');
  assert.equal(style['--accent'], 'rgba(99, 102, 241, 0.14)');
  assert.match(style['--page-backdrop'], /linear-gradient/);
  assert.ok(style['--radius']);
  assert.ok(style['--font-family']);
});

test('login view renders a module driven auth page', () => {
  const html = renderToStaticMarkup(
    createElement(LoginView, {
      appName: 'Demo SaaS',
      organizationName: 'demo-org',
      description: '登录 Demo SaaS',
      authorizeHref: 'http://localhost:5177/login/oauth/authorize?state=abc',
      signupHref: '/auth/signup',
      redirect: '/user/account',
    }),
  );

  assert.match(html, /Demo SaaS/);
  assert.match(html, /登录入口/);
  assert.match(html, /继续登录/);
  assert.match(html, /去注册/);
  assert.match(html, /\/login\/oauth\/authorize\?state=abc/);
  assert.match(html, /\/auth\/signup/);
  assert.match(html, /\/user\/account/);
});

test('signup view renders a module driven registration page', () => {
  const html = renderToStaticMarkup(
    createElement(SignupView, {
      appName: 'Demo SaaS',
      organizationName: 'demo-org',
      description: '注册 Demo SaaS',
      authorizeHref: 'http://localhost:5177/signup/oauth/authorize?state=xyz',
      loginHref: '/auth/login',
    }),
  );

  assert.match(html, /创建 Demo SaaS 账号/);
  assert.match(html, /继续注册/);
  assert.match(html, /返回登录/);
  assert.match(html, /\/signup\/oauth\/authorize\?state=xyz/);
  assert.match(html, /\/auth\/login/);
});

test('account view exposes subscription and credits sections for saas use', () => {
  const html = renderToStaticMarkup(
    createElement(AccountView, {
      appName: 'Demo SaaS',
      organizationName: 'demo-org',
      loginHref: '/auth/login',
      signupHref: '/auth/signup',
      logoutHref: '/logout',
      session: {
        id: 'user-1',
        name: 'Demo User',
        email: 'demo@example.com',
        image: null,
        isAuthenticated: true,
        isAdmin: false,
        tokenBalance: 128,
        isVip: true,
        role: 'user',
      },
      subscription: {
        subscriptionId: 'sub_1',
        planKey: 'pro',
        planName: 'Pro',
        status: 'active',
        interval: 'month',
      },
      subscriptionPlans: [
        {
          key: 'pro',
          kind: 'subscription',
          title: 'Pro',
          backendRef: { productId: 'demo/pro', planId: 'monthly' },
        },
      ],
      credits: { balance: 128 },
      products: [
        {
          productKey: 'credits-50',
          productId: 'demo/credits-50',
          title: '50 Credits',
          kind: 'product',
          creditGrant: { creditsPerUnit: 50 },
        },
      ],
      orderHistory: [
        {
          orderId: 'order-1',
          productKey: 'credits-50',
          productTitle: '50 Credits',
          status: 'paid',
        },
      ],
      paymentHistory: [
        {
          paymentId: 'pay-1',
          orderId: 'order-1',
          amount: 500,
          currency: 'CNY',
          status: 'paid',
        },
      ],
    }),
  );

  assert.match(html, /订阅状态/);
  assert.match(html, /积分购买/);
  assert.match(html, /Demo User/);
  assert.match(html, /50 Credits/);
  assert.match(html, /退出登录/);
  assert.match(html, /购买 50 Credits/);
});

test('auth document wraps pages with a full html shell', () => {
  const html = renderToStaticMarkup(
    createElement(
      AuthDocument,
      {
        title: 'Demo',
        description: 'Demo description',
      },
      createElement('main', null, 'demo'),
    ),
  );

  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /Demo description/);
  assert.match(html, /demo/);
});
