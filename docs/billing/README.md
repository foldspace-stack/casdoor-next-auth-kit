# Billing

这一部分说明面向 SaaS 订阅、积分商品和虚拟商品的 headless billing runtime。

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

runtime 也可以从 `runtimeConfig.items` 推导 `availablePlans` 和 `availableProducts`，但显式注入更利于宿主侧控制。

## 主要 Hooks

- `useBillingAvailablePlans`
- `useBillingAvailableProducts`
- `useBillingCatalog`
- `useBillingSubscription`
- `useBillingSubscriptionHistory`
- `useBillingSubscriptionProduct`
- `useBillingProducts`
- `useBillingProduct`
- `useBillingOrderHistory`
- `useBillingPaymentHistory`
- `useBillingCredits`
- `useBillingEntitlements`
- `useBillingPurchaseStatus`
- `useBillingRefresh`
- `useSubscribePlan`
- `usePurchaseProduct`

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
