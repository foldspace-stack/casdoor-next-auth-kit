# Billing

This section documents the headless billing runtime for SaaS subscriptions, credits, and virtual products.

## Scope

- Subscription purchase
- Product purchase
- Credits as a product extension
- Order, payment, transaction, and subscription history
- Purchase state and entitlement snapshots
- Provider-driven configuration injection

## Key Files

- [Billing Runtime Types](../../packages/auth-kit/src/billing/types.ts)
- [Billing Runtime Helpers](../../packages/auth-kit/src/billing/runtime.ts)
- [Billing React Hooks](../../packages/auth-kit/src/billing/react.tsx)

## Main Runtime Shape

- `BillingProvider`
- `BillingCoreProvider`
- `SubscriptionProvider`
- `ProductProvider`
- `CreditsProvider`

## Provider Inputs

For host apps, the available catalog is usually injected from backend config:

- `runtimeConfig`: full catalog configuration
- `availablePlans`: subscription items only
- `availableProducts`: product and credits items

The runtime can also derive `availablePlans` and `availableProducts` from `runtimeConfig.items`, but explicit injection keeps host-side control clearer.

## Main Hooks

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
- `usePurchaseCredits`

## Example Files

- [Billing catalog example](./examples/billing-catalog.example.ts)
- [Pricing section example](./examples/pricing-section.example.tsx)
- [Order history page example](./examples/order-history-page.example.tsx)
- [Mock api client example](./examples/mock-billing-api-client.example.ts)
