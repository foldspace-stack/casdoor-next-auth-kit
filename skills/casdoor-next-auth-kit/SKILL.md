---
name: casdoor-next-auth-kit
description: Use when maintaining the shared Casdoor auth kit, generated route shells, React auth hooks, or the host-project skill installation flow.
metadata:
  short-description: Shared Casdoor auth kit source of truth
---

# Casdoor Next Auth Kit

本 skill 用于维护可复用的 `@foldspace-fe/casdoor-next-auth-kit` 认证套件仓库，以及消费该套件的宿主项目。当用户需要修改认证流程、路由壳模板、React 认证钩子、或执行宿主项目的 skill 安装流程时，应激活此 skill。

本项目的核心价值，是把 Casdoor 原本依赖三方页面和分散接入的能力，整合到宿主工程内部统一管理，保持登录、购买、回跳和状态展示的一致体验，同时把安全边界和可控性留在宿主自己手里。

### 修改前必读

在改下面这些内容之前，先确认当前行为、生成结果和文档说明都已对齐：

- `packages/auth-kit/src/cli/templates.ts`
- `packages/auth-kit/src/cli/operations.ts`
- `packages/auth-kit/src/billing/*`
- `packages/auth-kit/src/core/env.ts`
- `docs/billing/*`
- `skills/casdoor-next-auth-kit/SKILL.md`

如果修改会影响生成文件，必须先回答这三个问题：

1. `npx @foldspace-fe/casdoor-next-auth-kit@latest init` 还能不能生成完整文件
2. `npx @foldspace-fe/casdoor-next-auth-kit@latest update` 会不会删除旧文件、补齐新文件并保持可编译
3. `pnpm build` 后宿主能不能直接 `next build`

如果任一答案不确定，先补齐实现和文档，再继续改需求。

在完成明显代码改动后，建议先跑 `pnpm lint`、`pnpm type-check` 和 `pnpm build`，再考虑提交或发布；这样可以尽早发现格式、类型和打包层面的回归。

## 源码仓库

- 仓库路径：`/root/projects/foldspace-stack/casdoor-next-auth-kit`
- 包名：`@foldspace-fe/casdoor-next-auth-kit`
- 宿主项目副本位置：`.agents/skills/casdoor-next-auth-kit/`

所有认证相关的源码、模板和配置均以上述仓库为唯一真相来源。宿主项目通过 CLI 工具获取生成物，不应直接修改套件内部代码。

## 支持的命令

```bash
npx @foldspace-fe/casdoor-next-auth-kit@latest init    # 初始化：安装 skill、生成路由壳、配置 Next.js
npx @foldspace-fe/casdoor-next-auth-kit@latest update   # 更新：重新生成路由壳、同步 skill 文件
npx @foldspace-fe/casdoor-next-auth-kit@latest check    # 检查：验证宿主项目配置与生成物是否一致
```

`init` 会将整个 skill 目录复制到宿主项目的 `.agents/skills/` 目录，并在宿主项目中生成路由壳文件。`update` 用于套件升级后同步变更。`check` 用于 CI 或手动验证，确保宿主项目未偏离套件的预期状态。

### 宿主项目里的用法

在宿主项目根目录执行下面的命令，不要在源码仓库内对宿主目录做手工 copy：

```bash
npx @foldspace-fe/casdoor-next-auth-kit@latest init
npx @foldspace-fe/casdoor-next-auth-kit@latest update
npx @foldspace-fe/casdoor-next-auth-kit@latest check
```

- `init` 适合第一次接入宿主项目，缺少受管路由壳、`.env*`、`prisma/auth-kit.prisma` 或 skill 副本时使用
- `update` 适合本仓库源码变更后，或宿主项目安装到新版本后使用
- `check` 不会改文件，只做一致性校验，适合在 CI 或手动排查时执行

如果宿主项目使用的是本地 `file:` 依赖或工作区链接，先在本仓库执行 `pnpm build`，再回到宿主项目执行 `pnpm install` 或 `npx @foldspace-fe/casdoor-next-auth-kit@latest update`，否则可能看到旧产物。

仓库发布到 npm 时使用 GitHub Actions Trusted Publisher / OIDC，不再依赖 `NPM_TOKEN`；CI 里需要保留 `id-token: write`，并让 `npm publish` 直接走受信发布流程。正式发布默认打到 `latest`；在纯 Trusted Publisher / OIDC 模式下不要要求 CI 再去同步 `next`，如果需要预发布通道，要单独设计认证方案。

## 套件提供的功能

- `AuthProvider` — React 认证上下文 Provider，包裹整个应用提供会话状态
- `useAuthSession` — 获取当前 NextAuth 会话对象
- `useAuthUser` — 获取当前登录用户信息（含 Casdoor 用户字段）
- `useAuthRole` — 获取当前用户的角色信息，用于权限判断
- `role` 是一等认证字段，Casdoor profile、callback、JWT/session、`useAuthUser`、`useAuthRole` 和生成的 `auth-config.ts` 会一起维护它；`isAdmin` 仍然保留兼容推导，但不要只依赖它
- `useAuthActions` — 提供登录、注册、注销等认证操作方法
- Casdoor 登录 / 注册入口处理器 — 处理用户进入认证流程的初始交互
- callback / logout / nextauth 路由处理器 — 处理 OAuth 回调、注销和 NextAuth 路由请求
- 无头电商代理处理器 — 将电商相关 API 请求代理到后端服务
- 宿主路由壳模板 — 为宿主项目生成 Next.js 路由页面模板，统一认证 UI 体验
- 数据库契约和同步接口 — 定义宿主项目必须实现的用户数据字段和同步行为
- `BillingProvider` / `BillingCoreProvider` — headless billing runtime 的根 Provider，支持 `purchasableIds` 白名单、`purchasables` 显式条目、Casdoor 商品购买适配器和购买回调 hooks
- `SubscriptionProvider` / `ProductProvider` / `CreditsProvider` — 分域 billing Provider，按需注入订阅、商品和额度状态
- `buildBillingSubscriptionCatalog` — 把宿主已有的会员计划 rows 转成 auth-kit 的 subscription catalog，适合 membership 这种“订阅为主、商品为辅”的接入场景
- `useBillingAvailablePlans` / `useBillingAvailableProducts` — 从配置或注入的 catalog 中读取可订阅套餐和可购买商品列表，并自动过滤白名单外条目
- `useBillingPricing` / `useBillingPlan` / `useBillingPricingPlans` / `useBillingSubscriptionPurchaseOptions` — 读取订阅定价、单个计划、计划组合和订阅购买选项
- `useBillingSubscription` / `useBillingSubscriptionHistory` / `useBillingSubscriptionRecord` / `useBillingSubscriptions` / `useBillingSubscriptionProduct` — 查看当前订阅、订阅历史、订阅记录、订阅列表和当前订阅对应产品
- `useBillingProducts` / `useBillingProduct` / `useBillingProductDetail` / `useBillingProductPurchaseOptions` / `useBillingOrder` / `useBillingOrders` / `useBillingOrderHistory` / `useBillingPaymentHistory` — 查看商品状态、商品详情、商品购买选项、单条订单、订单列表、订单历史和支付历史
- `useBillingCredits` / `useBillingEntitlements` / `useBillingPurchaseStatus` — 查看额度、权益和归一化购买状态
- `useSubscribePlan` / `usePurchaseProduct` — 发起订阅和商品购买动作，单次购买只针对一个具体条目；订阅购买会先走定价和计划查询，商品购买会先走商品详情解析，再组装 Casdoor 的下单参数
- `useBillingRefresh` / `useBillingPipeline` — 刷新 billing 状态和编排动作执行链路

订阅域和商品域要保持分离：`kind: 'subscription'` 的 catalog 条目只负责定价、计划和订阅状态，`kind: 'product'` 的 catalog 条目只负责商品、订单和支付状态。两类条目可以共存于同一个 catalog，但不要把它们压成一套无差别的购买对象。
这条约定已经由 `packages/auth-kit/test/billing-subscription-domain.test.ts` 锁住；后续如果调整 catalog、购买 payload 或订阅购买路径，优先更新这个回归测试，确保订阅和商品仍然是两条独立链路。

## 路由模型

认证套件采用同源路由架构，所有认证相关页面均在宿主应用域名下呈现：

- `/auth/login` — 宿主项目的登录入口路由，用户点击登录后进入此页面
- `/auth/signup` — 宿主项目的注册入口路由，用户点击注册后进入此页面
- `/login/oauth/authorize` — 同源登录授权壳，宿主项目渲染 Casdoor 的登录表单界面
- `/signup/oauth/authorize` — 同源注册授权壳，宿主项目渲染 Casdoor 的注册表单界面
- `/callback` — OAuth 回调路由，处理 Casdoor 认证成功后的回调
- `/callback/error` — 回调错误提示页，默认以视口居中、小尺寸卡片呈现错误信息，包含明显的错误状态视觉锚点，并提供“清空当前域 Cookie”按钮，帮助用户清理残留认证 cookie 后重新登录
- `/logout` — 注销路由，优先用 `Clear-Site-Data: "cookies"` 清空当前域 cookie，再补一轮 `Set-Cookie` 删除兜底，并跳转到首页或 `AuthKitConfig.logoutRedirectPath`；如果目标路径和当前页相同，则按刷新处理
- `/auth/api/*` — Casdoor API 代理，所有个人操作的 API 请求通过此路径转发
- billing 的购买页、二维码扫描区和支付状态面板都由宿主工程自己控制，套件只提供 headless hooks、Casdoor 购买适配器、支付回调 handler 和纯数据模型；`packages/auth-kit/src/core/index-html.ts` 不参与 billing 页面生成

入口路由（login/signup）负责将用户引导至授权壳，授权壳在同源 iframe 或内嵌组件中渲染 Casdoor 界面，避免用户感知到离开宿主应用。

如果宿主希望注销后回到自定义配置页，可以在 `AuthKitConfig` 中设置 `logoutRedirectPath`，默认值为 `/`。
若想通过环境变量控制默认值，可设置 `NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT_PATH=/` 或其他同源路径。

Billing 的购买白名单可以通过 `BillingCatalogConfig.purchasableIds` 或宿主注入的 `purchasables` 显式配置。宿主只需要在自己的项目里维护允许购买的少量条目，Casdoor 里可以继续保留更大的商品集合。订阅的 `pricing / plan` 不是 env 配置项，而是通过 `buildBillingSubscriptionCatalog()` 的 `mapPlan` 映射成 catalog 数据；env 模板里放的是白名单示例，不是定价本身。

如果宿主要同时配订阅和商品，推荐直接按这个结构写：

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
};
```

商品购买的包内适配器会优先读取 Casdoor 商品详情，再按 `owner/name` 解析商品 ID，并自动选择可用 provider 后调用 `buy-product` 兼容接口；宿主只需要提供允许购买的商品 id 和相应的 Casdoor 接口 loader。loader 约定使用 Casdoor 的标准响应 envelope，然后从 `data` 中取出商品、组织、账号、应用或支付记录。`buy-product` 如果返回 `status: "error"`，包内会把 `msg` 里的错误信息和错误码透传到宿主的 `onPurchaseError` / `onPurchaseComplete`。`useBillingProductDetail` 会把商品详情里的 `providers` 和 `providerObjs` 暴露给宿主，`useBillingProductPurchaseOptions` 可以直接拿到商品详情、当前 provider 选择、当前选中 provider 对象和 setter，适合商品详情页按支付方式展示不同购买参数；宿主选中的 `providerName` 也可以直接传给 `purchaseProduct.run({ key, providerName })`，让包内适配器按这个 provider 下单。这个 hook 只是给单选场景提供默认态，如果宿主想同时渲染两个不同的支付入口，直接遍历 `providerObjs` 就行，`selectedProvider` 不会限制 UI 结构。`productId` 推荐写成 `owner/name` 形式，例如 `qixiaoju/创小剧积分包-50`，和 `GET /api/get-product?id=qixiaoju/创小剧积分包-50` 的查询值保持一致。支付结果轮询和 `get-account` / `get-application` / `get-payment` 这类浏览器侧查询，优先请求 `/auth/api/*` 同域代理；只有服务端或明确启用 CORS 的特殊场景，才考虑直接连 `NEXT_PUBLIC_CASDOOR_SERVER_URL` origin 的 `/api/*`。

SaaS 订阅状态建议直接接 Casdoor 的 `get-pricing` / `get-plan` / `get-subscription` / `get-subscriptions`，产品购买后的订单列表和订单状态建议直接接 Casdoor 的 `get-order` / `get-orders` / `get-payment`。宿主本地的 `BillingSubscriptionState`、`BillingOrderHistoryItem`、`BillingPurchaseStatus` 只应该是归一化展示层，不应该成为真相源；如果宿主需要展示订阅计划价格、计划列表、订单详情或支付明细，优先从这些 Casdoor 查询 loader 里取 `data`。订阅 catalog 条目和商品 catalog 条目可以共存，但 UI 和购买参数生成要保持两个分支各自独立。

## 宿主工程 `proxy.ts` 配置要求

`proxy.ts` 是宿主工程的 Next.js middleware（通常放在项目根目录，在 `next.config.ts` 中通过 `middleware` 字段指向），不属于 `@foldspace-fe/casdoor-next-auth-kit` 的受管文件。它的核心职责是**认证守卫**——拦截未登录用户对业务页面的访问，将其重定向到登录页；同时放行所有公开路径和认证流程路径。

### `proxy.ts` 的核心职责

1. **放行公开路径** — 无需认证即可访问的页面和资源
2. **认证守卫** — 对非公开路径验证会话 token，未登录时重定向到 `/auth/login`
3. **不在认证路径上做 origin 重写** — origin 规范由宿主的边缘层（FRP / Ingress / 网关）和套件内部的 API 代理头部清理共同完成

### 公开路径清单

以下路径必须放行，不做认证检查：

```ts
const PUBLIC_PATH_PREFIXES = [
  '/_next',            // Next.js 静态资源
  '/api',              // 宿主自有 API（不含认证守卫）
  '/auth/api',         // Casdoor API 代理（套件内部转发已做头部清理）
  '/auth/login',       // 登录入口
  '/auth/signup',      // 注册入口
  '/login/oauth/authorize',   // 登录授权壳
  '/signup/oauth/authorize',  // 注册授权壳
  '/logout',           // 注销
  '/callback',         // OAuth 回调
];
```

以下精确路径也应放行：

```ts
const PUBLIC_EXACT_PATHS = new Set([
  '/',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  // 以及宿主业务需要的公开页面
]);
```

静态资源文件（`.png`、`.jpg`、`.svg`、`.css`、`.js` 等）也应放行。

### 会话 token 提取

`proxy.ts` 需要从 cookie 中提取 NextAuth 会话 token。套件导出了 `decodeSessionToken` 供宿主使用：

```ts
import { decodeSessionToken } from '@foldspace-fe/casdoor-next-auth-kit';

const token = getSessionTokenFromCookies(request);
if (!token) {
  // 重定向到登录页
}

const decoded = await decodeSessionToken({
  token,
  secret: process.env.NEXTAUTH_SECRET || 'dev-nextauth-secret',
});
if (!decoded) {
  // token 无效或过期，重定向到登录页
}
```

cookie 名称按优先级提取：

1. `__Secure-next-auth.session-token`（生产环境，cookie secure 模式）
2. `next-auth.session-token`（开发环境）
3. 分片 cookie（`next-auth.session-token.0`、`.1`、…，按数字排序拼接）

### 推荐的完整实现

```ts
import { NextRequest, NextResponse } from 'next/server';
import { decodeSessionToken } from '@foldspace-fe/casdoor-next-auth-kit';

function getAppOrigin() {
  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || '';
  if (!appUrl) return null;
  try { return new URL(appUrl).origin; } catch { return null; }
}

const PUBLIC_PATH_PREFIXES = [
  '/_next',
  '/api',
  '/auth/api',
  '/auth/login',
  '/auth/signup',
  '/login/oauth/authorize',
  '/signup/oauth/authorize',
  '/logout',
  '/callback',
];

const PUBLIC_EXACT_PATHS = new Set([
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
]);

function isPublicPath(pathname: string) {
  if (pathname === '/') return true;
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true;
  if (/\.(png|jpg|jpeg|svg|gif|webp|ico|css|js)$/.test(pathname)) return true;
  if (pathname === '/static' || pathname.startsWith('/static/')) return true;
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function getSessionTokenFromCookies(request: NextRequest): string | null {
  const secureBaseName = '__Secure-next-auth.session-token';
  const baseName = 'next-auth.session-token';

  const direct =
    request.cookies.get(secureBaseName)?.value ||
    request.cookies.get(baseName)?.value;
  if (direct) return direct;

  const chunkCandidates = request.cookies
    .getAll()
    .filter((c) => c.name.startsWith(`${secureBaseName}.`) || c.name.startsWith(`${baseName}.`))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  if (chunkCandidates.length === 0) return null;
  return chunkCandidates.map((c) => c.value).join('');
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = getSessionTokenFromCookies(request);
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const decoded = await decodeSessionToken({
    token,
    secret: process.env.NEXTAUTH_SECRET || 'dev-nextauth-secret',
  });
  if (!decoded) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = { matcher: '/:path*' };
```

> `/auth/api/*` 路径不需要宿主额外处理头部清理。套件的 `proxyRequest` 在转发给 Casdoor 时会自动删除 `origin`、`referer`、`x-forwarded-host`、`x-forwarded-port`、`x-forwarded-proto` 和 `forwarded`，确保上游只看到干净的请求头。

### 实现要求

- 公开路径必须完整放行，不做认证检查也不做任何重写
- 认证守卫只在非公开路径生效，未登录时重定向到 `/auth/login` 并保留原始路径作为 `redirect` 参数
- 使用套件导出的 `decodeSessionToken` 验证会话，不要自己实现 JWT 解码
- 不要修改 `app/(auth-kit)` 下的受管路由壳
- 不要在 `proxy.ts` 里硬编码 Casdoor 域名
- 不要在认证路径上做 origin 307 重写——origin 规范由边缘层和套件代理头部清理共同完成

### 与环境变量的关系

宿主工程必须保证：

- `APP_URL` 和 `NEXTAUTH_URL` 一致
- 生产环境必须使用公网 HTTPS 地址
- 本地开发可以使用 `http://localhost:5177`

推荐示例：

```env
APP_URL=https://dev-chuangxiaoju.agent-lattice.cn
NEXTAUTH_URL=https://dev-chuangxiaoju.agent-lattice.cn
```

本地开发示例：

```env
APP_URL=http://localhost:5177
NEXTAUTH_URL=http://localhost:5177
```

### 常见故障

如果出现以下情况：

- 登录页能打开，但提交后 403
- `redirect_uri` 变成了 `http://.../callback`
- 本地正常，线上失败
- 反向代理后回调地址不对

优先检查：

1. `APP_URL` 是否为真实公网 HTTPS
2. `NEXTAUTH_URL` 是否与 `APP_URL` 保持一致
3. FRP / Ingress / 网关是否把外部 HTTPS 请求错误地暴露成了内部 HTTP
4. 浏览器实际访问地址是否和授权回调地址一致
5. 宿主边缘层是否对认证路径做了 origin 规范（HTTPS → 公网 origin）

## UX 边界

- 保持 Casdoor 认证体验完全内嵌于宿主应用，用户不应感知到"跳转到另一个网站"
- 优先使用同源路由壳和代理处理器，而非直接让浏览器导航到 Casdoor 原始页面
- 宿主用户应体验到一个统一的应用，不应看到宿主 UI 和 Casdoor UI 之间的割裂
- 所有认证交互（登录、注册、MFA、密码重置等）均应在宿主应用域名下完成

## 数据库边界

- 套件定义必需的用户字段、同步行为和适配器接口（契约），但不实现持久化
- 宿主项目拥有 Prisma schema、迁移脚本和持久化实现的完全控制权
- 业务特有的数据表和写入逻辑应保留在宿主项目中，不应混入认证套件
- 套件通过接口约定宿主项目必须提供哪些字段（如 Casdoor 用户 ID、用户名等），宿主项目自行决定存储方式
- 默认生成的 `app/(auth-kit)/auth-config.ts` 是自包含的，能够在没有宿主数据库、`@/lib/db` 或额外权限模块的情况下直接编译；billing 处理器由套件默认生成到 `lib/billing/payment-success.ts` 和 `lib/billing/payment-finished.ts`，`auth-config.ts` 会直接导入这两个默认文件。若宿主需要落库、角色同步或自定义管理员策略，可以再在对应 custom block 里接入自己的实现

## Skill 分发流程

1. 在独立仓库中更新此 skill 目录中的 `SKILL.md`、`references/` 和相关源码
2. 使用 `scripts/install-skill.mjs` 将整个 skill 目录复制到宿主项目的 `.agents/skills/` 目录
3. 如果生成的路由壳文件有变更，重新运行宿主项目的检查命令确认一致性

### 更新成功的排查方法

当你执行 `npx @foldspace-fe/casdoor-next-auth-kit@latest update` 后，可以按下面顺序确认是否真的生效：

1. 先看终端输出
   - 成功更新时，CLI 会输出 `Updated managed route shells, env files, and skill file.`
   - 如果有文件变化，会额外打印 `+`、`~` 或 `-` 的路径列表
2. 再运行一致性检查
   - `npx @foldspace-fe/casdoor-next-auth-kit@latest check`
   - 成功时应输出 `All managed files are present.`
3. 核对受管文件是否已经刷新
   - `app/(auth-kit)/...`
   - `prisma/auth-kit.prisma`
   - `.env`、`.env.local`、`.env.production`、`.env.example`
   - `.agents/skills/casdoor-next-auth-kit/SKILL.md`
   - 其中 `NEXT_PUBLIC_BILLING_PURCHASABLE_IDS` 的默认示例值会写成 `membership-monthly,credits-50`
4. 如果 `check` 仍然报缺失，优先排查这些问题
   - 宿主项目还没重新安装到新的包产物，先回到本仓库执行 `pnpm build`
   - 宿主项目没重新安装依赖，执行 `pnpm install` 后再跑一次 `update`
   - 当前目录不是宿主项目根目录，CLI 写到了错误位置
   - 旧的受管文件仍然存在，需要先让 `update` 完成删除和重建，再执行 `check`

分发流程确保宿主项目始终从独立仓库获取最新的 skill 定义、参考资料和生成物，避免各宿主项目各自维护不一致的认证配置。

## API 参考

- `references/casdoor-api-reference.md` — Casdoor 个人操作 API 参考（markdown 格式，路径含 `/auth/` 前缀）
- `references/swagger.json` — 相同内容的 Swagger 2.0 格式（仅包含个人相关端点，已过滤管理类 API）

这两个参考文件覆盖了认证套件通过 `/auth/api/*` 代理的 Casdoor API 端点。利用它们可以了解套件的无头代理处理器支持哪些面向个人用户的操作（账户管理、登录注册、商品购买、订单查询、支付、订阅等）。

## Billing Headless 参考

Billing headless 能力的方案、接口草案和设计图已经放在仓库文档中：

- `docs/billing/README.md` — billing 分类文档入口和功能总览
- `docs/billing/examples/billing-catalog.example.ts` — billing catalog 配置示例
- `docs/billing/examples/pricing-section.example.tsx` — pricing section 页面骨架示例
- `docs/billing/examples/order-history-page.example.tsx` — 订单和订阅历史页面骨架示例
- `docs/billing/examples/mock-billing-api-client.example.ts` — mock api client 示例

Billing 的宿主接入方式是：

1. 在宿主应用里通过 `BillingProvider` 注入 `runtimeConfig` 或显式的 `availablePlans` / `availableProducts`
2. 如果要做订阅面板，优先用 `useBillingPricing` / `useBillingPlan` / `useBillingPricingPlans` / `useBillingSubscriptionPurchaseOptions`
3. 如果要做商品面板，优先用 `useBillingProductDetail` / `useBillingProductPurchaseOptions`
4. 使用 `useSubscribePlan`、`usePurchaseProduct` 发起动作
5. 使用 `useBillingSubscription`、`useBillingSubscriptionHistory`、`useBillingSubscriptionRecord`、`useBillingSubscriptions`、`useBillingOrder`、`useBillingOrders`、`useBillingOrderHistory`、`useBillingPaymentHistory`、`useBillingCredits` 查看状态
6. 使用 `useBillingPipeline` 或 `actionExecutor` 接入宿主自己的支付、跳转和后端编排逻辑

购买动作只保留两类：

- `useSubscribePlan` 处理订阅购买
- `usePurchaseProduct` 处理一次性商品购买

`usePurchaseCredits` 已经移除，积分包也不再作为独立 kind 存在；如果宿主需要积分语义，应在 `product` 上通过 `creditGrant`、`metadata` 或宿主回调处理。

Billing 只面向数字商品和 SaaS 订阅，不包含 UI 组件，也不包含物流、地址、发货或其他非商品功能。

### 支付回调约定

Billing 支付成功后，Casdoor 会回跳到宿主站内的两个固定回调路径：

- `/auth/payment/success`：支付成功接收路由
- `/auth/payment/finished`：支付完成后的固定回调路径

这两个路径都不是页面，都是宿主自己的回调壳。套件会默认生成宿主侧处理器文件：

- `lib/billing/payment-success.ts`
- `lib/billing/payment-finished.ts`

`app/(auth-kit)/auth-config.ts` 会直接导入这两个默认文件，并把它们暴露为：

- `paymentSuccessHandler`
- `paymentFinishedHandler`

宿主可以直接改这两个默认生成文件里的 custom block 来完成订单补全、Webhook 钩子、积分发放和最终跳转，而不需要额外手工创建 `@/lib/billing/*`。

默认回调上下文会同时带上 `paymentOwner`、`paymentName`、`paymentId`、`orderId`、`redirectTo`、`status` 和完整 query 参数，宿主在 custom block 里可以直接做订单系统对接和后置处理。

默认生成的 billing handler 文件必须保持“拿来就能编译”，文件里如果没有业务逻辑，也要保留可运行的空实现和明确日志，不允许生成只写注释或只留导入的半成品。

默认生成的 callback error page 也必须保持可编译，并在错误提示外额外提供本地清 cookie 按钮；按钮逻辑必须只在浏览器端执行，不能依赖服务端接口。

`app/(auth-kit)/auth-config.ts` 必须显式导出 `authKitConfig`、`adapter`、`persistence`、`paymentSuccessHandler` 和 `paymentFinishedHandler`，route 文件必须能直接从这个文件拿到所需配置和 handler，不要只保留局部变量让 route 间接取值。

billing 默认就是受管内容，CLI 必须同时生成 `lib/billing/payment-success.ts` 和 `lib/billing/payment-finished.ts`，`auth-config.ts` 直接导入这两个默认文件，不要要求宿主手工创建 `@/lib/billing/*`。

如果默认处理器没有写入业务逻辑，路由仍会打印日志并回退到默认落点：

- success 路由默认回退到 `/auth/payment/finished`
- finished 路由默认回退到 `/`

`BILLING_PAYMENT_SUCCESS_DEBUG=true` 时，会额外打印请求路径、query 和 body，方便排查回跳参数。

## 宿主项目集成要点

- 优先使用套件提供的 React 钩子（如 `useAuthSession`、`useAuthActions`），而非直接导入 `next-auth/react`
- 保持宿主路由壳文件尽量简洁，认证逻辑应由套件内部处理
- 使用套件 CLI 工具管理生成文件，不要手动修改生成的路由壳代码
- 宿主项目的 AGENTS.md 应指向此仓库，以便 AI 代理获取最新上下文
- Billing 相关接入优先导入 `@foldspace-fe/casdoor-next-auth-kit/react` 和 `@foldspace-fe/casdoor-next-auth-kit/billing`
- Billing 的可购买列表优先由宿主配置注入，必要时再由 runtimeConfig 派生，而不是在页面里硬编码
- Billing 只应基于 `references/swagger.json` 的个人相关端点和宿主编排实现，不要把管理侧 API 当成运行时依赖
- 生成的 `app/(auth-kit)/auth-config.ts` 默认是可编译的自包含实现；它只会依赖套件默认生成的 `lib/billing/payment-success.ts` 和 `lib/billing/payment-finished.ts`。如需接入宿主自己的数据库、角色判断或用户同步，可以在文件内的 custom block 里替换对应实现，而不是改动受管路由壳
