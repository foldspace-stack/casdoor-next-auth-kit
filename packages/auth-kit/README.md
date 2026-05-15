# @foldspace-fe/casdoor-next-auth-kit

[![npm version](https://img.shields.io/npm/v/@foldspace-fe/casdoor-next-auth-kit?label=npm)](https://www.npmjs.com/package/@foldspace-fe/casdoor-next-auth-kit)
[![npm downloads](https://img.shields.io/npm/dm/@foldspace-fe/casdoor-next-auth-kit?label=downloads)](https://www.npmjs.com/package/@foldspace-fe/casdoor-next-auth-kit)

Headless Casdoor auth and billing toolkit for Next.js.

This package provides:

- Host-side login, signup, callback, and logout route shells
- React provider and hook wrappers for auth state
- Headless billing runtime for SaaS subscriptions, virtual products, and credits
- CLI helpers to generate and validate the managed host files

## Install

```bash
npm install @foldspace-fe/casdoor-next-auth-kit
```

Or with your preferred package manager:

```bash
pnpm add @foldspace-fe/casdoor-next-auth-kit
yarn add @foldspace-fe/casdoor-next-auth-kit
```

## Quick Start

### Auth

```ts
import {
  createLoginEntryResponse,
  createSignupEntryResponse,
} from '@foldspace-fe/casdoor-next-auth-kit';
```

### React Auth Hooks

```tsx
'use client';

import {
  AuthProvider,
  useAuthSession,
  useAuthUser,
} from '@foldspace-fe/casdoor-next-auth-kit/react';
```

### Billing Runtime

```ts
import type { BillingCatalogConfig } from '@foldspace-fe/casdoor-next-auth-kit/billing';
import { BillingProvider } from '@foldspace-fe/casdoor-next-auth-kit/react';
```

### Billing Actions

```tsx
'use client';

import {
  useSubscribePlan,
  usePurchaseProduct,
  usePurchaseCredits,
} from '@foldspace-fe/casdoor-next-auth-kit/react';
```

## CLI

```bash
npx @foldspace-fe/casdoor-next-auth-kit init
npx @foldspace-fe/casdoor-next-auth-kit update
npx @foldspace-fe/casdoor-next-auth-kit check
```

## Package Exports

- `@foldspace-fe/casdoor-next-auth-kit`
- `@foldspace-fe/casdoor-next-auth-kit/react`
- `@foldspace-fe/casdoor-next-auth-kit/billing`
- `@foldspace-fe/casdoor-next-auth-kit/next`

## Docs

- [Repository README](https://github.com/foldspace-stack/casdoor-next-auth-kit)
- [Auth docs](https://github.com/foldspace-stack/casdoor-next-auth-kit/blob/main/docs/auth/README.md)
- [Billing docs](https://github.com/foldspace-stack/casdoor-next-auth-kit/blob/main/docs/billing/README.md)
- [CLI docs](https://github.com/foldspace-stack/casdoor-next-auth-kit/blob/main/docs/cli/README.md)
- [Skills docs](https://github.com/foldspace-stack/casdoor-next-auth-kit/blob/main/docs/skills/README.md)

## npm

- Package page: https://www.npmjs.com/package/@foldspace-fe/casdoor-next-auth-kit
- Publish scope: `@foldspace-fe`
