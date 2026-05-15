---
name: casdoor-next-auth-kit
description: Use when maintaining the shared Casdoor auth kit, generated route shells, React auth hooks, or the host-project skill installation flow.
metadata:
  short-description: Shared Casdoor auth kit source of truth
---

# Casdoor Next Auth Kit

本 skill 用于维护可复用的 `@foldspace-fe/casdoor-next-auth-kit` 认证套件仓库，以及消费该套件的宿主项目。当用户需要修改认证流程、路由壳模板、React 认证钩子、或执行宿主项目的 skill 安装流程时，应激活此 skill。

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

## 套件提供的功能

- `AuthProvider` — React 认证上下文 Provider，包裹整个应用提供会话状态
- `useAuthSession` — 获取当前 NextAuth 会话对象
- `useAuthUser` — 获取当前登录用户信息（含 Casdoor 用户字段）
- `useAuthRole` — 获取当前用户的角色信息，用于权限判断
- `useAuthActions` — 提供登录、注册、注销等认证操作方法
- Casdoor 登录 / 注册入口处理器 — 处理用户进入认证流程的初始交互
- callback / logout / nextauth 路由处理器 — 处理 OAuth 回调、注销和 NextAuth 路由请求
- 无头电商代理处理器 — 将电商相关 API 请求代理到后端服务
- 宿主路由壳模板 — 为宿主项目生成 Next.js 路由页面模板，统一认证 UI 体验
- 数据库契约和同步接口 — 定义宿主项目必须实现的用户数据字段和同步行为
- `BillingProvider` / `BillingCoreProvider` — headless billing runtime 的根 Provider
- `SubscriptionProvider` / `ProductProvider` / `CreditsProvider` — 分域 billing Provider，按需注入订阅、商品和额度状态
- `useBillingAvailablePlans` / `useBillingAvailableProducts` — 从配置或注入的 catalog 中读取可订阅套餐和可购买商品列表
- `useBillingSubscription` / `useBillingSubscriptionHistory` / `useBillingSubscriptionProduct` — 查看当前订阅、订阅历史和当前订阅对应产品
- `useBillingProducts` / `useBillingProduct` / `useBillingOrderHistory` / `useBillingPaymentHistory` — 查看商品状态、订单历史和支付历史
- `useBillingCredits` / `useBillingEntitlements` / `useBillingPurchaseStatus` — 查看额度、权益和归一化购买状态
- `useSubscribePlan` / `usePurchaseProduct` / `usePurchaseCredits` — 发起订阅、虚拟商品购买和积分购买动作
- `useBillingRefresh` / `useBillingPipeline` — 刷新 billing 状态和编排动作执行链路

## 路由模型

认证套件采用同源路由架构，所有认证相关页面均在宿主应用域名下呈现：

- `/auth/login` — 宿主项目的登录入口路由，用户点击登录后进入此页面
- `/auth/signup` — 宿主项目的注册入口路由，用户点击注册后进入此页面
- `/login/oauth/authorize` — 同源登录授权壳，宿主项目渲染 Casdoor 的登录表单界面
- `/signup/oauth/authorize` — 同源注册授权壳，宿主项目渲染 Casdoor 的注册表单界面
- `/callback` — OAuth 回调路由，处理 Casdoor 认证成功后的回调
- `/logout` — 注销路由，清除会话并跳转
- `/auth/api/*` — Casdoor API 代理，所有个人操作的 API 请求通过此路径转发

入口路由（login/signup）负责将用户引导至授权壳，授权壳在同源 iframe 或内嵌组件中渲染 Casdoor 界面，避免用户感知到离开宿主应用。

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
2. 使用 `useSubscribePlan`、`usePurchaseProduct`、`usePurchaseCredits` 发起动作
3. 使用 `useBillingSubscription`、`useBillingOrderHistory`、`useBillingPaymentHistory`、`useBillingCredits` 查看状态
4. 使用 `useBillingPipeline` 或 `actionExecutor` 接入宿主自己的支付、跳转和后端编排逻辑

Billing 只面向数字商品和 SaaS 订阅，不包含 UI 组件，也不包含物流、地址、发货或其他非商品功能。

## 宿主项目集成要点

- 优先使用套件提供的 React 钩子（如 `useAuthSession`、`useAuthActions`），而非直接导入 `next-auth/react`
- 保持宿主路由壳文件尽量简洁，认证逻辑应由套件内部处理
- 使用套件 CLI 工具管理生成文件，不要手动修改生成的路由壳代码
- 宿主项目的 AGENTS.md 应指向此仓库，以便 AI 代理获取最新上下文
- Billing 相关接入优先导入 `@foldspace-fe/casdoor-next-auth-kit/react` 和 `@foldspace-fe/casdoor-next-auth-kit/billing`
- Billing 的可购买列表优先由宿主配置注入，必要时再由 runtimeConfig 派生，而不是在页面里硬编码
- Billing 只应基于 `references/swagger.json` 的个人相关端点和宿主编排实现，不要把管理侧 API 当成运行时依赖
