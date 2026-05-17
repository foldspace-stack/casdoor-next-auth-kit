# `@foldspace-fe/casdoor-next-auth-kit`

这是独立仓库的主方案文档，作为认证包、billing headless、demo、CLI 和 skill 分发的 source of truth。

## 目标

- 将 Casdoor 登录、PKCE、回调、退出、React auth hooks、commerce 转发、billing headless 做成可复用的包。
- 把 Casdoor 的站外能力包装成站内可控壳子，避免宿主用户感知到 Casdoor 页面跳转。
- 登录、注册、回调、退出、commerce 这些能力都以 host route shells 的方式暴露，URL 保持稳定，但真正的 Casdoor 交互由包来代理。
- 主工程只保留薄路由壳、业务用户同步和 Prisma 持久化。
- 包通过 npm scope `@foldspace-fe/casdoor-next-auth-kit` 发布。
- 用 `npx @foldspace-fe/casdoor-next-auth-kit init` 和 `update` 管理宿主工程生成文件。
- 用 skill 文件把这套用法同步到宿主项目的 `.agents/skills`。

## 模块边界

### 包负责

- Casdoor 授权入口的站内封装
- OAuth callback 的站内闭环
- logout
- React auth hooks
- commerce/headless 接口转发
- billing headless 的 provider / hooks / runtime / payload 规范
- host route shell 模板
- 数据库契约和同步需求
- skill 的源码和分发脚本

### 宿主负责

- Prisma schema 和表结构
- 用户、订单、订阅、积分等业务数据的存储
- 业务级跳转和页面内容
- `@next-auth/prisma-adapter` 或同类存储适配依赖
- 站点的最终视觉和导航体验

## 交互基线

包的核心原则是“用户只感知宿主站点，不直接感知 Casdoor”。

建议遵循下面的交互边界：

- `/auth/login` 负责发起站内登录入口
- `/auth/signup` 负责发起站内注册入口
- `/login/oauth/authorize` 由宿主提供 route shell，承载 Casdoor 登录授权页
- `/signup/oauth/authorize` 由宿主提供 route shell，承载 Casdoor 注册授权页
- `/callback`、`/logout` 由宿主提供 route shell
- 宿主 route shell 通过包生成的 handler 调起 Casdoor 流程
- Casdoor 的 API 请求走 `/auth/api/*` 这类同源代理路径
- 登录成功后回到宿主站点的 callback，再由宿主完成 session 落库和页面跳转
- React 组件和 hooks 只暴露宿主需要的认证状态和动作，不直接泄露 Casdoor 原生页面结构

### 推荐命名

为了让宿主侧的配置与生成器保持一致，建议按下面的项目命名约定理解：

- `NEXT_PUBLIC_CASDOOR_APP_NAME=qixiaoju`
- `NEXT_PUBLIC_CASDOOR_ORGANIZATION_NAME=qixiaoju`

实际的 Casdoor 组织、应用和重定向仍由宿主项目环境变量决定，但包的文档和生成器应默认把它们当成同一个站点命名空间来处理。

## 数据库契约

包只定义“需要什么”，不接管宿主的建表实现。

建议对外暴露：

- auth user / profile / membership 相关记录的字段需求
- commerce order / subscription / invoice 的最小字段需求
- 与 Casdoor 同步相关的用户身份字段
- 可复用的 adapter 接口和同步回调类型

宿主工程只实现：

- schema
- migration
- upsert / sync / query
- billing catalog 配置注入
- 订阅、商品、积分、订单、支付状态的业务编排

## React 层

宿主工程不要再直接从 `next-auth/react` 读取状态，统一改用包导出的 hooks：

- `AuthProvider`
- `useAuthSession`
- `useAuthUser`
- `useAuthRole`
- `useAuthActions`
- `BillingProvider`
- `BillingCoreProvider`
- `SubscriptionProvider`
- `ProductProvider`
- `CreditsProvider`
- `useBillingAvailablePlans`
- `useBillingAvailableProducts`
- `useBillingSubscription`
- `useBillingSubscriptionHistory`
- `useBillingProducts`
- `useBillingOrderHistory`
- `useBillingPaymentHistory`
- `useBillingCredits`
- `useBillingEntitlements`
- `useBillingPurchaseStatus`
- `useSubscribePlan`
- `usePurchaseProduct`

## CLI

CLI 约定如下：

```bash
npx @foldspace-fe/casdoor-next-auth-kit init
npx @foldspace-fe/casdoor-next-auth-kit update
npx @foldspace-fe/casdoor-next-auth-kit check
```

- `init`：首次生成 route shells 和 `.env.example`
- `update`：刷新包管理的受管文件
- `check`：只校验，不改文件

## Billing Headless

Billing headless 只覆盖标准数字商品场景：

- SaaS 订阅
- 虚拟商品
- 订单历史
- 支付历史
- 订阅历史
- 当前订阅产品与购买状态

它的配置注入方式是：

- `runtimeConfig`
- `availablePlans`
- `availableProducts`

三类对象统一建模为：

- `subscription`
- `product`

### 支付回调

Billing 的支付回调统一使用两个固定路径：

- `/auth/payment/success`
- `/auth/payment/finished`

这两个路径都不是页面，而是宿主自己的回调壳。宿主通过 `.env` 注入：

- `BILLING_PAYMENT_SUCCESS_HANDLER`
- `BILLING_PAYMENT_FINISHED_HANDLER`

回调处理器负责根据 `paymentId`、`orderId`、query 参数和 body 做订单补全、Webhook 钩子、积分发放和最终跳转。没有配置 handler 时，success 默认回退到 `/auth/payment/finished`，finished 默认回退到 `/`。

## 路由 shell 约定

宿主工程应该把认证相关路由集中到 `app/(auth-kit)` 这组 route group 下。

推荐保持以下结构：

- `app/(auth-kit)/auth/login`
- `app/(auth-kit)/auth/signup`
- `app/(auth-kit)/login/oauth/authorize`
- `app/(auth-kit)/signup/oauth/authorize`
- `app/(auth-kit)/callback`
- `app/(auth-kit)/logout`
- `app/(auth-kit)/auth/api/*`
- `app/(auth-kit)/api/auth/*`

其中 `auth/api` 是 Casdoor 同源代理入口，`api/auth` 是 NextAuth 路由入口。

## Skill 分发

仓库内的 skill 是 canonical 版本。

安装到目标项目时，写入：

- `TARGET/.agents/skills/casdoor-next-auth-kit/SKILL.md`

建议通过 `scripts/install-skill.mjs` 完成复制。

## Demo 工程

`apps/demo` 负责：

- 验证 login / callback / logout 的完整站内闭环
- 验证 React hooks
- 验证 commerce 转发
- 验证更新后的 route shell 是否仍然可运行

## 发布顺序

1. 完成本仓库开发
2. 在 demo 中跑通
3. 通过 GitHub Actions push/tag 自动计算版本并发布到 npm
4. 宿主工程切换到 npm 版本
