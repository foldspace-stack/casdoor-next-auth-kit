# Billing

这一部分说明面向 SaaS 订阅和一次性商品的 headless billing runtime。

## 快速结论

- 订阅域只负责 `pricing / plan / subscription`
- 商品域只负责 `product / order / payment`
- 购买页、二维码区、状态面板都由宿主自己渲染
- 套件只提供 headless hooks、Casdoor 适配器、回调 handler 和标准响应类型
- 如果宿主已经有自己的会员计划 rows，可以先用 `buildBillingSubscriptionCatalog()` 把计划数组转成 subscription catalog，再交给 `BillingProvider` 和 `useSubscribePlan`
- CLI 生成受管路由时会自动识别宿主使用的是 `app` 还是 `src/app`，并把这些受管文件写到对应的 `(auth-kit)` 目录下
- 跟随 app root 变化的有两类文件：受管 route shells 和 `auth-config.ts` 会落到 `app/(auth-kit)` 或 `src/app/(auth-kit)`，`lib/billing/*` 和 `prisma/auth-kit.prisma` 则会在 `src/app` 项目下自动落到 `src/lib/billing/*`、`src/prisma/auth-kit.prisma`，在普通 `app` 项目下保留根目录；`.env*` 始终在项目根目录

### 订阅定价模板

订阅的 `pricing / plan` 不是放在 `.env` 里配置的，而是放在 billing catalog 里。一个可以直接复制的模板如下：

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

上面这个模板表达的是：

- `membershipPlans` 负责订阅定价
- `buildBillingSubscriptionCatalog()` 把会员计划映射成 subscription catalog
- `purchasableIds` 只放当前项目允许买的条目
- `items` 里可以再并入一次性商品，但订阅和商品仍然是两条分开的链路

## 修改前必读

在改 `packages/auth-kit/src/cli/templates.ts`、`packages/auth-kit/src/cli/operations.ts`、`packages/auth-kit/src/billing/*`、`docs/billing/*` 或 `skills/casdoor-next-auth-kit/SKILL.md` 之前，先确认三件事：

1. `npx @foldspace-fe/casdoor-next-auth-kit@latest init` 还能生成完整文件
2. `npx @foldspace-fe/casdoor-next-auth-kit@latest update` 会补齐受管文件并保持可编译
3. `pnpm build` 后宿主可以直接 `next build`

如果会影响生成文件，优先把宿主 app root 下的 `/(auth-kit)/auth-config.ts`、`lib/billing/order-redirect.ts`、`lib/billing/payment-success.ts` 和 `lib/billing/payment-finished.ts` 一起对齐，再改文档。

## 覆盖范围

- 订阅购买
- 商品购买
- 积分作为商品扩展
- 订单、支付、交易和订阅历史
- 购买状态和权益快照
- 基于 provider 的配置注入

## 关键文件

- [Billing Runtime 类型](../../packages/auth-kit/src/billing/types.ts)
- [Billing Runtime 辅助函数](../../packages/auth-kit/src/billing/runtime.ts)
- [Casdoor Payment Session Helper](../../packages/auth-kit/src/billing/casdoor-payment-session.ts)
- [Casdoor Plan Product Helper](../../packages/auth-kit/src/billing/casdoor-plan-product.ts)
- [Casdoor Shared Helpers](../../packages/auth-kit/src/billing/casdoor-helpers.ts)
- [Billing Subscription Catalog Bridge](../../packages/auth-kit/src/billing/subscription-catalog.ts)
- [Billing React Hooks](../../packages/auth-kit/src/billing/react.tsx)

## 主要运行时结构

- `BillingProvider`
- `BillingCoreProvider`
- `SubscriptionProvider`
- `ProductProvider`
- `CreditsProvider`

## Provider 输入

对宿主应用来说，可用商品目录通常来自后端配置注入：

- `runtimeConfig`: full catalog configuration
- `availablePlans`: subscription items only
- `availableProducts`: product items
- `purchasableIds`: 当前工程允许购买的 item key / productId / planId 白名单
- `purchasables`: 当前工程允许购买的显式条目定义，适合需要补充 hooks 或额外字段的场景

当宿主需要直接对接 Casdoor 商品购买时，还可以提供 `fetchProduct`、`fetchOrganizationNames` 和 `buyProduct` 这类 loader，让包内购买适配器按 `owner/name` 解析商品 ID 并自动选择 provider。这里 loader 约定拿到的是 Casdoor 的标准响应 envelope，再从 `data` 里取出商品或组织列表。这样宿主只需要配置少量允许购买的 product id，Casdoor 里可以继续保留更大的商品集合。`buy-product` 如果返回 `status: "error"`，包内会把 `msg` 里的错误信息和错误码透传到宿主的 `onPurchaseError` / `onPurchaseComplete`，例如微信支付限制场景里的 `NO_AUTH`。

如果宿主想把 Casdoor 协议层能力抽成可复用 helper，可以直接用这些文件：

- `packages/auth-kit/src/billing/casdoor-payment-session.ts`
  - 负责 `buy-product`、二维码会话、`get-payment`、`notify-payment`、支付状态归一化
- `packages/auth-kit/src/billing/casdoor-plan-product.ts`
  - 负责 `get-pricing`、`get-plan` 和 `plan.product -> owner/product` 的解析
- `packages/auth-kit/src/billing/casdoor-helpers.ts`
  - 负责商品 ID 归一化和 provider 选择等共享小工具

这三者只负责 Casdoor 协议行为，宿主业务仍然应该自己维护本地订单、积分发放、会员授予和 UI 交互。

如果宿主要做 SaaS 订阅购买，建议把 `fetchPricing` / `pricingLoader`、`fetchPlan` / `planLoader`、`fetchSubscriptionRecord` / `subscriptionRecordLoader`、`fetchSubscriptions` / `subscriptionsLoader` 接到 Casdoor 原生 `get-pricing`、`get-plan`、`get-subscription`、`get-subscriptions`。这样订阅状态、订阅历史和套餐价格都直接来自 Casdoor，不需要在宿主本地再维护一套“伪订阅状态”。

如果宿主要做标准商品购买，建议把 `fetchOrder` / `orderLoader`、`fetchOrders` / `ordersLoader`、`fetchPayment` / `paymentLoader` 接到 Casdoor 原生 `get-order`、`get-orders`、`get-payment`。这样产品购买后的订单列表、订单状态和支付状态都以 Casdoor 为准，宿主只负责展示和后置业务，不负责重建支付事实。

建议宿主侧的 `productId` 直接使用 `owner/name` 格式，例如 `qixiaoju/创小剧积分包-50`，它要和 `GET /api/get-product?id=qixiaoju/创小剧积分包-50` 里的查询值保持一致；如果只配置 Casdoor 原始的内部 ID，包内适配器在缺少商品详情 loader 时会回退到旧的通用 action 流程。

`useBillingProductDetail(productId)` 可以直接拿到 Casdoor 商品详情，包括 `providers` 和 `providerObjs`，适合商品详情页展示支持的支付方式，以及按 provider 生成不同的购买参数。

当宿主选择了某个支付方式后，可以把对应的 `providerName` 直接传给 `usePurchaseProduct().run({ key, providerName })`，让包内适配器用这个 provider 发起 Casdoor 下单。

如果宿主想少写一些样板代码，可以直接用 `useBillingProductPurchaseOptions(productId)`，它会同时返回商品详情、`providers`、`providerObjs`、当前选中的 `providerName`，并带一个 `setProviderName`。

这个 hook 只是给单选场景提供默认态；如果宿主想同时渲染两个不同的支付入口，直接遍历 `providerObjs` 就行，`selectedProvider` 只是一个方便的当前选中项引用，不会限制宿主的 UI 结构。

billing 的页面层由宿主工程自己掌控。套件不生成 product page、buy page、二维码扫描页或 payment result page，只提供 headless hooks、Casdoor 购买适配器、支付回调 handler 和纯数据模型。宿主如果要展示二维码、支付状态或订单详情，可以在自己的页面或弹层里直接读取 `BillingCasdoorPaymentResponse`、`BillingCasdoorAccountResponse`、`BillingCasdoorApplicationResponse`，或者使用对应的 loader 结果。

同一套 loader 约定也适用于 `fetchAccount`、`fetchApplication` 和 `fetchPayment`：浏览器侧默认走 `/auth/api/get-account`、`/auth/api/get-application`、`/auth/api/get-payment` 这类同域代理，避免跨域；只有服务端或明确启用 CORS 的特殊场景，才考虑直接请求 `NEXT_PUBLIC_CASDOOR_SERVER_URL` 对应 origin 的 `/api/get-account`、`/api/get-application`、`/api/get-payment`。

支付结果轮询同样优先走 `/auth/api/get-payment?id=...`。如果必须直连 Casdoor origin，两种场景都仍然使用同一套 response envelope，真正的数据都放在 `data` 里。

从数据职责上看，`useBillingSubscription` / `useBillingSubscriptionHistory` 更适合展示 Casdoor subscription 查询结果，`useBillingOrderHistory` / `useBillingPurchaseStatus` 更适合展示 Casdoor order / payment 查询结果。换句话说，用户的订阅状态应该以 Casdoor 的 `get-pricing` / `get-plan` / `get-subscription` / `get-subscriptions` 为准，购买产品后的订单列表和订单状态应该以 Casdoor 的 `get-order` / `get-orders` / `get-payment` 为准，包内只做归一化和展示编排。

订阅 catalog 条目和商品 catalog 条目可以放在同一个 `BillingCatalogConfig` 里，但两者仍然要保持语义分离：订阅条目只负责 pricing / plan / subscription，商品条目只负责 product / order / payment。宿主可以在同一页面里并排渲染它们，但不要把它们合并成同一种购买对象。

为了让宿主更容易把这些查询结果渲染成自己的 UI，billing 还提供了组合式 headless hooks：

- `useBillingPricing` / `useBillingPlan` / `useBillingPricingPlans` - 读取订阅定价、单个计划和定价下的计划组合
- `useBillingSubscriptionRecord` / `useBillingSubscriptions` - 读取单条订阅记录和订阅列表
- `useBillingOrder` / `useBillingOrders` - 读取单条订单和订单列表
- `useBillingSubscriptionPurchaseOptions` - 读取订阅定价、计划列表和当前选中的计划，方便宿主渲染订阅购买面板

runtime 也可以从 `runtimeConfig.items` 推导 `availablePlans` 和 `availableProducts`，但显式注入更利于宿主侧控制。
当 `purchasableIds` 非空时，`BillingProvider` 只会对名单内的商品做购买动作和可购买列表暴露。

## 主要 Hooks

- `useBillingAvailablePlans`
- `useBillingAvailableProducts`
- `useBillingCatalog`
- `useBillingSubscription`
- `useBillingSubscriptionHistory`
- `useBillingSubscriptionProduct`
- `useBillingProducts`
- `useBillingProduct`
- `useBillingProductDetail`
- `useBillingProductPurchaseOptions`
- `useBillingOrderHistory`
- `useBillingPaymentHistory`
- `useBillingCredits`
- `useBillingEntitlements`
- `useBillingPurchaseStatus`
- `useBillingRefresh`
- `useSubscribePlan`
- `usePurchaseProduct`
- `useBillingPipeline`

## 示例文件

- [Billing catalog 示例](./examples/billing-catalog.example.ts)
- [Pricing section 示例](./examples/pricing-section.example.tsx)
- [订单历史页面示例](./examples/order-history-page.example.tsx)
- [Mock api client 示例](./examples/mock-billing-api-client.example.ts)

## 对接时序

- [Billing 到 Casdoor 的对接时序图](./CASDOOR-INTEGRATION-TIMELINE.svg)
- 支付回跳分成 `/auth/payment/success` 和 `/auth/payment/finished` 两个固定回调路径，分别由宿主处理器接管

## 回调约定

- 套件默认生成 `lib/billing/order-redirect.ts`、`lib/billing/payment-success.ts` 和 `lib/billing/payment-finished.ts`；如果宿主使用 `src/app`，这些文件会分别生成到 `src/lib/billing/*`
- 宿主 app root 下的 `/(auth-kit)/auth-config.ts` 会直接导入这两个默认文件，并暴露为 `paymentSuccessHandler` / `paymentFinishedHandler`
- `payment-success.ts` 和 `payment-finished.ts` 都会直接导入 `lib/billing/order-redirect.ts`（`src/app` 项目下则是 `src/lib/billing/order-redirect.ts`），用来保证 update 后回跳归一化 helper 仍然存在
- 两个回调都能接收 `paymentId`、`orderId`、query 参数和 body，由宿主自己在默认生成文件里完成落库、Webhook 钩子和最终跳转
