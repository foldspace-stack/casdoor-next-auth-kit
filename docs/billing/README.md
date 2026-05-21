# Billing

这一部分说明面向 SaaS 订阅和一次性商品的 headless billing runtime。

## 快速结论

- 订阅域只负责 `pricing / plan / subscription`
- 商品域只负责 `product / order / payment`
- 购买页、二维码区、状态面板都由宿主自己渲染
- 套件只提供 headless hooks、Casdoor 适配器、回调 handler 和标准响应类型

## 修改前必读

在改 `packages/auth-kit/src/cli/templates.ts`、`packages/auth-kit/src/cli/operations.ts`、`packages/auth-kit/src/billing/*`、`docs/billing/*` 或 `skills/casdoor-next-auth-kit/SKILL.md` 之前，先确认三件事：

1. `npx @foldspace-fe/casdoor-next-auth-kit@latest init` 还能生成完整文件
2. `npx @foldspace-fe/casdoor-next-auth-kit@latest update` 会补齐受管文件并保持可编译
3. `pnpm build` 后宿主可以直接 `next build`

如果会影响生成文件，优先把 `app/(auth-kit)/auth-config.ts`、`lib/billing/payment-success.ts` 和 `lib/billing/payment-finished.ts` 一起对齐，再改文档。

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

- 套件默认生成 `lib/billing/payment-success.ts` 和 `lib/billing/payment-finished.ts`
- `app/(auth-kit)/auth-config.ts` 会直接导入这两个默认文件，并暴露为 `paymentSuccessHandler` / `paymentFinishedHandler`
- 两个回调都能接收 `paymentId`、`orderId`、query 参数和 body，由宿主自己在默认生成文件里完成落库、Webhook 钩子和最终跳转
