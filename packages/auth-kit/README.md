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
import type { BillingCatalogConfig } from '@foldspace-fe/casdoor-next-auth-kit/billing';
import { BillingProvider } from '@foldspace-fe/casdoor-next-auth-kit/react';
```

### Billing 动作

```tsx
'use client';

import {
  useSubscribePlan,
  usePurchaseProduct,
  usePurchaseCredits,
} from '@foldspace-fe/casdoor-next-auth-kit/react';
```

## 最常用命令

```bash
npx @foldspace-fe/casdoor-next-auth-kit init
npx @foldspace-fe/casdoor-next-auth-kit update
npx @foldspace-fe/casdoor-next-auth-kit check
```

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
