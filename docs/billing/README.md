# Billing

这一部分说明面向 SaaS 订阅、积分商品和虚拟商品的 headless billing runtime。

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

当宿主需要直接对接 Casdoor 商品购买时，还可以提供 `fetchProduct`、`fetchOrganizationNames` 和 `buyProduct` 这类 loader，让包内购买适配器按 `owner/name` 解析商品 ID 并自动选择 provider。这里 loader 约定拿到的是 Casdoor 的标准响应 envelope，再从 `data` 里取出商品或组织列表。这样宿主只需要配置少量允许购买的 product id，Casdoor 里可以继续保留更大的商品集合。

建议宿主侧的 `productId` 直接使用 `owner/name` 格式，例如 `qixiaoju/创小剧积分包-50`，它要和 `GET /api/get-product?id=qixiaoju/创小剧积分包-50` 里的查询值保持一致；如果只配置 Casdoor 原始的内部 ID，包内适配器在缺少商品详情 loader 时会回退到旧的通用 action 流程。

`useBillingProductDetail(productId)` 可以直接拿到 Casdoor 商品详情，包括 `providers` 和 `providerObjs`，适合商品详情页展示支持的支付方式，以及按 provider 生成不同的购买参数。

当宿主选择了某个支付方式后，可以把对应的 `providerName` 直接传给 `usePurchaseProduct().run({ key, providerName })`，让包内适配器用这个 provider 发起 Casdoor 下单。

如果宿主想少写一些样板代码，可以直接用 `useBillingProductPurchaseOptions(productId)`，它会同时返回商品详情、`providers`、`providerObjs`、当前选中的 `providerName`，并带一个 `setProviderName`。

这个 hook 只是给单选场景提供默认态；如果宿主想同时渲染两个不同的支付入口，直接遍历 `providerObjs` 就行，`selectedProvider` 只是一个方便的当前选中项引用，不会限制宿主的 UI 结构。

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
