# Billing 到 Casdoor 的对接时序

这份图描述的是：`docs/billing/examples/billing-catalog.example.ts` 里的配置，最后如何通过宿主侧的 `backendRef` 和回跳处理器，和 Casdoor 对接起来。

要点：

- `kind: 'subscription' | 'product'` 是包内 billing 抽象，不是 Casdoor 原生字段
- 真正对接 Casdoor 的是 `backendRef.productId / planId / priceId`
- 支付成功后的 `Success URL` 统一落到宿主的 `/auth/payment/success`
- 购买成功后的 `Return URL` 统一落到宿主的 `/auth/payment/finished`
- `.env` 里的 `BILLING_PAYMENT_SUCCESS_HANDLER` 和 `BILLING_PAYMENT_FINISHED_HANDLER` 决定宿主函数从哪里导入
- 宿主函数自己解析 `paymentId`、`orderId` 和其它 query 参数，再做落库、Webhook 钩子和二次跳转

```mermaid
sequenceDiagram
  autonumber
  participant Admin as 宿主后端/配置层
  participant Catalog as billing-catalog.example.ts
  participant UI as BillingProvider + React Hooks
  participant Host as 宿主 actionExecutor / API
  participant Casdoor as Casdoor Billing API
  participant Success as /auth/payment/success
  participant Finished as /auth/payment/finished
  participant SuccessHandler as BILLING_PAYMENT_SUCCESS_HANDLER
  participant FinishedHandler as BILLING_PAYMENT_FINISHED_HANDLER
  participant DB as 宿主数据库 / Webhook 钩子

  Admin->>Catalog: 定义 BillingCatalogConfig
  Catalog->>Catalog: items[].kind / backendRef / creditGrant
  Catalog->>UI: 注入 runtimeConfig 或 availablePlans / availableProducts
  UI->>UI: 根据 kind 渲染订阅 / 普通商品 / 积分商品
  UI->>Host: useSubscribePlan / usePurchaseProduct
  Host->>Host: 将 BillingItem 映射成 Casdoor payload
  Host->>Casdoor: 发送 productId / planId / priceId / metadata
  Casdoor->>Casdoor: 创建订单 / 付款 / 交易
  Casdoor-->>Success: 302 Redirect 到 /auth/payment/success?paymentId=...&orderId=...
  Success->>Success: 收集全部 query 参数
  Success->>SuccessHandler: 按 .env 导入 paymentSuccessHandler
  SuccessHandler->>SuccessHandler: 自行解析 paymentId / orderId / params
  SuccessHandler->>DB: 写订单、支付、交易或触发 webhook 钩子
  SuccessHandler-->>Success: 返回 redirectTo / Response / void
  Success-->>Finished: 默认或业务指定时跳转到 /auth/payment/finished
  Finished->>Finished: 收集全部 query 参数
  Finished->>FinishedHandler: 按 .env 导入 paymentFinishedHandler
  FinishedHandler->>FinishedHandler: 自行解析 paymentId / orderId / params
  FinishedHandler->>DB: 继续做收尾、通知或最终跳转
  FinishedHandler-->>Finished: 返回 redirectTo / Response / void
  Finished-->>UI: 重定向到首页或业务指定落点
```

## 映射说明

示例里的三种 item 只是运行时分类，不直接等于 Casdoor 的原生实体：

- `subscription` 通常映射到 Casdoor 的计划/订阅购买链路
- `product` 通常映射到一次性商品购买链路
- 积分包通常是 `product` 的一种业务语义，购买后额外发放积分

Casdoor 侧实际需要的是：

- `productId`
- `planId`
- `priceId`
- `metadata`

宿主后端负责把 `BillingCatalogConfig` 翻译成 Casdoor 可执行的购买参数，并在成功回跳和完成回调时分别用 `BILLING_PAYMENT_SUCCESS_HANDLER`、`BILLING_PAYMENT_FINISHED_HANDLER` 接管后续业务。
