# @foldspace-fe/casdoor-next-auth-kit

[![npm version](https://img.shields.io/npm/v/@foldspace-fe/casdoor-next-auth-kit?label=npm)](https://www.npmjs.com/package/@foldspace-fe/casdoor-next-auth-kit)
[![npm downloads](https://img.shields.io/npm/dm/@foldspace-fe/casdoor-next-auth-kit?label=downloads)](https://www.npmjs.com/package/@foldspace-fe/casdoor-next-auth-kit)

面向 Next.js 的无头 Casdoor 认证与 billing 工具包。

提供：

- 宿主站内登录、注册、回调、注销路由壳
- 认证状态与动作的 React Provider / Hook
- SaaS 订阅、虚拟商品、积分商品的 headless billing runtime
- 生成和校验宿主受管文件的 CLI

## 安装

```bash
npm install @foldspace-fe/casdoor-next-auth-kit
```

也可以使用你常用的包管理器：

```bash
pnpm add @foldspace-fe/casdoor-next-auth-kit
yarn add @foldspace-fe/casdoor-next-auth-kit
```

## 快速开始

### 认证导入

```ts
import {
  createLoginEntryResponse,
  createSignupEntryResponse,
} from '@foldspace-fe/casdoor-next-auth-kit';
```

### React 认证

```tsx
'use client';

import {
  AuthProvider,
  useAuthSession,
  useAuthUser,
} from '@foldspace-fe/casdoor-next-auth-kit/react';
```

### Billing runtime

```ts
import { buildBillingSubscriptionCatalog } from '@foldspace-fe/casdoor-next-auth-kit/billing';
import { BillingProvider } from '@foldspace-fe/casdoor-next-auth-kit/react';
```

如果宿主已经有自己的会员计划 rows，先用 `buildBillingSubscriptionCatalog()` 生成 subscription catalog，再把结果交给 `BillingProvider`。商品项仍然可以单独拼进同一个 catalog，但订阅和商品要保持语义分离。

一个可以直接复制的完整模板如下：

```ts
const membershipPlans = [
  {
    id: 'plan-basic',
    code: 'membership-monthly',
    name: 'Membership Monthly',
    level: 'BASIC',
    priceCents: 99900,
    giftPoints: 10000,
    billingCycle: 'MONTH',
    benefits: {
      faceLibrary: true,
      monthlyReports: true,
    },
  },
];

const subscriptionCatalog = buildBillingSubscriptionCatalog(membershipPlans, {
  catalogKey: 'main',
  title: 'Billing Catalog',
  mapPlan: (plan) => ({
    source: plan,
    key: plan.code,
    title: plan.name,
    description: `${plan.level} membership`,
    productId: 'qixiaoju/创小剧会员订阅',
    planId: plan.id,
    priceId: `pricing_${plan.code}`,
    interval: 'month',
    priceValue: plan.priceCents,
    metadata: {
      level: plan.level,
      giftPoints: String(plan.giftPoints),
      billingCycle: plan.billingCycle,
    },
  }),
});

const billingCatalog = {
  ...subscriptionCatalog,
  purchasableIds: [...subscriptionCatalog.purchasableIds, 'credits-50'],
  items: [
    ...subscriptionCatalog.items,
    {
      key: 'credits-50',
      kind: 'product',
      title: '50 Credits',
      description: 'One-time product used for credits or other non-recurring goods.',
      credits: 50,
      backendRef: {
        productId: 'qixiaoju/创小剧积分包-50',
        priceId: 'price_credits_50',
      },
      creditGrant: {
        creditsPerUnit: 50,
        unitName: 'credits',
      },
    },
  ],
};
```

如果你只是想配白名单，`.env` 里可以直接写：

```env
NEXT_PUBLIC_BILLING_PURCHASABLE_IDS=membership-monthly,credits-50
```

### Billing 动作

```tsx
'use client';

import {
  useSubscribePlan,
  usePurchaseProduct,
} from '@foldspace-fe/casdoor-next-auth-kit/react';
```

## 最常用命令

```bash
npx @foldspace-fe/casdoor-next-auth-kit@latest init
npx @foldspace-fe/casdoor-next-auth-kit@latest update
npx @foldspace-fe/casdoor-next-auth-kit@latest check
npx @foldspace-fe/casdoor-next-auth-kit@latest --version
```

`npx` 会读取 package 的 `bin` 入口并运行 `casdoor-next-auth-kit` CLI。

## 包导出

- `@foldspace-fe/casdoor-next-auth-kit`
- `@foldspace-fe/casdoor-next-auth-kit/react`
- `@foldspace-fe/casdoor-next-auth-kit/billing`
- `@foldspace-fe/casdoor-next-auth-kit/next`

## 文档

- [仓库 README](https://github.com/foldspace-stack/casdoor-next-auth-kit)
- [Auth 文档](https://github.com/foldspace-stack/casdoor-next-auth-kit/blob/main/docs/auth/README.md)
- [Billing 文档](https://github.com/foldspace-stack/casdoor-next-auth-kit/blob/main/docs/billing/README.md)
- [CLI 文档](https://github.com/foldspace-stack/casdoor-next-auth-kit/blob/main/docs/cli/README.md)
- [Skills 文档](https://github.com/foldspace-stack/casdoor-next-auth-kit/blob/main/docs/skills/README.md)

## npm

- 包页面：https://www.npmjs.com/package/@foldspace-fe/casdoor-next-auth-kit
- 发布 scope：`@foldspace-fe`
