'use client';

import { useMemo } from 'react';
import { useAuthUser } from './hooks';
import { useBillingAvailablePlans, useBillingAvailableProducts, useBillingCredits, useBillingProductPurchaseOptions, useBillingSubscription, useBillingSubscriptionPurchaseOptions, usePurchaseProduct, useSubscribePlan } from './react';
import type { BillingCasdoorPlanDetail, BillingItem, BillingProductState } from '../shared/types';
import type { AuthThemeTokens } from './theme';
import { AccountView } from './views';

export interface AuthAccountDashboardProps {
  appName: string;
  organizationName: string;
  loginHref?: string;
  signupHref?: string;
  logoutHref?: string;
  subscriptionPricingId?: string;
  productId?: string;
  theme?: AuthThemeTokens;
  className?: string;
}

export function AuthAccountDashboard({
  appName,
  organizationName,
  loginHref = '/auth/login',
  signupHref = '/auth/signup',
  logoutHref = '/logout',
  subscriptionPricingId,
  productId,
  theme,
  className,
}: AuthAccountDashboardProps) {
  const user = useAuthUser();
  const subscription = useBillingSubscription();
  const credits = useBillingCredits();
  const availablePlans = useBillingAvailablePlans();
  const availableProducts = useBillingAvailableProducts();
  const subscribePlan = useSubscribePlan();
  const purchaseProduct = usePurchaseProduct();

  if (subscriptionPricingId && productId) {
    return (
      <AuthAccountDashboardWithCatalogs
        appName={appName}
        organizationName={organizationName}
        loginHref={loginHref}
        signupHref={signupHref}
        logoutHref={logoutHref}
        theme={theme}
        className={className}
        user={user}
        subscription={subscription.subscription}
        credits={credits.credits}
        availablePlans={normalizeSubscriptionPlans(availablePlans.plans)}
        availableProducts={normalizeProductStates(availableProducts.items)}
        subscriptionPricingId={subscriptionPricingId}
        productId={productId}
        subscribePlan={subscribePlan}
        purchaseProduct={purchaseProduct}
      />
    );
  }

  if (subscriptionPricingId) {
    return (
      <AuthAccountDashboardWithSubscription
        appName={appName}
        organizationName={organizationName}
        loginHref={loginHref}
        signupHref={signupHref}
        logoutHref={logoutHref}
        theme={theme}
        className={className}
        user={user}
        subscription={subscription.subscription}
        credits={credits.credits}
        availablePlans={normalizeSubscriptionPlans(availablePlans.plans)}
        availableProducts={normalizeProductStates(availableProducts.items)}
        subscriptionPricingId={subscriptionPricingId}
        subscribePlan={subscribePlan}
        purchaseProduct={purchaseProduct}
      />
    );
  }

  if (productId) {
    return (
      <AuthAccountDashboardWithProduct
        appName={appName}
        organizationName={organizationName}
        loginHref={loginHref}
        signupHref={signupHref}
        logoutHref={logoutHref}
        theme={theme}
        className={className}
        user={user}
        subscription={subscription.subscription}
        credits={credits.credits}
        availableProducts={normalizeProductStates(availableProducts.items)}
        availablePlans={normalizeSubscriptionPlans(availablePlans.plans)}
        productId={productId}
        subscribePlan={subscribePlan}
        purchaseProduct={purchaseProduct}
      />
    );
  }

  return (
    <AccountView
      appName={appName}
      organizationName={organizationName}
      loginHref={loginHref}
      signupHref={signupHref}
      logoutHref={logoutHref}
      session={user}
      subscription={subscription.subscription}
      subscriptionPlans={normalizeSubscriptionPlans(availablePlans.plans)}
      credits={credits.credits}
      products={normalizeProductStates(availableProducts.items)}
      onSubscribePlan={async (planKey) => {
        await subscribePlan.run({ kind: 'subscribe', key: subscriptionPricingId ?? planKey });
      }}
      onPurchaseProduct={async (nextProductKey, providerName) => {
        await purchaseProduct.run({ kind: 'purchase', key: productId ?? nextProductKey, providerName });
      }}
      theme={theme}
      className={className}
    />
  );
}

function AuthAccountDashboardWithSubscription({
  appName,
  organizationName,
  loginHref,
  signupHref,
  logoutHref,
  theme,
  className,
  user,
  subscription,
  credits,
  availablePlans,
  availableProducts,
  subscriptionPricingId,
  subscribePlan,
  purchaseProduct,
}: {
  appName: string;
  organizationName: string;
  loginHref: string;
  signupHref: string;
  logoutHref: string;
  theme?: AuthThemeTokens;
  className?: string;
  user: ReturnType<typeof useAuthUser>;
  subscription: ReturnType<typeof useBillingSubscription>['subscription'];
  credits: ReturnType<typeof useBillingCredits>['credits'];
  availablePlans: ReturnType<typeof useBillingAvailablePlans>['plans'];
  availableProducts: BillingProductState[];
  subscriptionPricingId: string;
  subscribePlan: ReturnType<typeof useSubscribePlan>;
  purchaseProduct: ReturnType<typeof usePurchaseProduct>;
}) {
  const subscriptionOptions = useBillingSubscriptionPurchaseOptions(subscriptionPricingId);
  const subscriptionPlans: BillingItem[] = useMemo(
    () => normalizeSubscriptionPlans(subscriptionOptions.plans ?? availablePlans),
    [availablePlans, subscriptionOptions.plans],
  );

  return (
    <AccountView
      appName={appName}
      organizationName={organizationName}
      loginHref={loginHref}
      signupHref={signupHref}
      logoutHref={logoutHref}
      session={user}
      subscription={subscription}
      subscriptionPlans={subscriptionPlans}
      credits={credits}
      products={normalizeProductStates(availableProducts)}
      onSubscribePlan={async (planKey) => {
        await subscribePlan.run({ kind: 'subscribe', key: subscriptionPricingId ?? planKey });
      }}
      onPurchaseProduct={async (nextProductKey, providerName) => {
        await purchaseProduct.run({ kind: 'purchase', key: nextProductKey, providerName });
      }}
      theme={theme}
      className={className}
    />
  );
}

function AuthAccountDashboardWithProduct({
  appName,
  organizationName,
  loginHref,
  signupHref,
  logoutHref,
  theme,
  className,
  user,
  subscription,
  credits,
  availableProducts,
  availablePlans,
  productId,
  subscribePlan,
  purchaseProduct,
}: {
  appName: string;
  organizationName: string;
  loginHref: string;
  signupHref: string;
  logoutHref: string;
  theme?: AuthThemeTokens;
  className?: string;
  user: ReturnType<typeof useAuthUser>;
  subscription: ReturnType<typeof useBillingSubscription>['subscription'];
  credits: ReturnType<typeof useBillingCredits>['credits'];
  availableProducts: BillingProductState[];
  availablePlans: ReturnType<typeof useBillingAvailablePlans>['plans'];
  productId: string;
  subscribePlan: ReturnType<typeof useSubscribePlan>;
  purchaseProduct: ReturnType<typeof usePurchaseProduct>;
}) {
  const productOptions = useBillingProductPurchaseOptions(productId);

  return (
    <AccountView
      appName={appName}
      organizationName={organizationName}
      loginHref={loginHref}
      signupHref={signupHref}
      logoutHref={logoutHref}
      session={user}
      subscription={subscription}
      subscriptionPlans={normalizeSubscriptionPlans(availablePlans)}
      credits={credits}
      products={normalizeProductStates(availableProducts)}
      onSubscribePlan={async (planKey) => {
        await subscribePlan.run({ kind: 'subscribe', key: planKey });
      }}
      onPurchaseProduct={async (nextProductKey, providerName) => {
        await purchaseProduct.run({ kind: 'purchase', key: productId ?? nextProductKey, providerName: providerName ?? productOptions.providerName });
      }}
      theme={theme}
      className={className}
    />
  );
}

function AuthAccountDashboardWithCatalogs({
  appName,
  organizationName,
  loginHref,
  signupHref,
  logoutHref,
  theme,
  className,
  user,
  subscription,
  credits,
  availablePlans,
  availableProducts,
  subscriptionPricingId,
  productId,
  subscribePlan,
  purchaseProduct,
}: {
  appName: string;
  organizationName: string;
  loginHref: string;
  signupHref: string;
  logoutHref: string;
  theme?: AuthThemeTokens;
  className?: string;
  user: ReturnType<typeof useAuthUser>;
  subscription: ReturnType<typeof useBillingSubscription>['subscription'];
  credits: ReturnType<typeof useBillingCredits>['credits'];
  availablePlans: ReturnType<typeof useBillingAvailablePlans>['plans'];
  availableProducts: BillingProductState[];
  subscriptionPricingId: string;
  productId: string;
  subscribePlan: ReturnType<typeof useSubscribePlan>;
  purchaseProduct: ReturnType<typeof usePurchaseProduct>;
}) {
  const subscriptionOptions = useBillingSubscriptionPurchaseOptions(subscriptionPricingId);
  const productOptions = useBillingProductPurchaseOptions(productId);
  const subscriptionPlans: BillingItem[] = useMemo(
    () => normalizeSubscriptionPlans(subscriptionOptions.plans ?? availablePlans),
    [availablePlans, subscriptionOptions.plans],
  );
  const products: BillingProductState[] = useMemo(() => normalizeProductStates(availableProducts), [availableProducts]);

  return (
    <AccountView
      appName={appName}
      organizationName={organizationName}
      loginHref={loginHref}
      signupHref={signupHref}
      logoutHref={logoutHref}
      session={user}
      subscription={subscription}
      subscriptionPlans={subscriptionPlans}
      credits={credits}
      products={products}
      onSubscribePlan={async (planKey) => {
        await subscribePlan.run({ kind: 'subscribe', key: subscriptionPricingId ?? planKey });
      }}
      onPurchaseProduct={async (nextProductKey, providerName) => {
        await purchaseProduct.run({ kind: 'purchase', key: productId ?? nextProductKey, providerName: providerName ?? productOptions.providerName });
      }}
      theme={theme}
      className={className}
    />
  );
}

function normalizeSubscriptionPlans(plans: Array<BillingItem | BillingCasdoorPlanDetail> | undefined | null): BillingItem[] {
  return (plans ?? []).map((plan): BillingItem => (isBillingItem(plan) ? plan : normalizeCasdoorPlan(plan)));
}

function normalizeProductStates(products: Array<BillingItem | BillingProductState> | undefined | null): BillingProductState[] {
  return (products ?? []).map((product): BillingProductState => (isBillingProductState(product) ? product : normalizeCatalogProduct(product)));
}

function isBillingItem(value: BillingItem | BillingCasdoorPlanDetail): value is BillingItem {
  return 'backendRef' in value && 'kind' in value && 'title' in value;
}

function isBillingProductState(value: BillingItem | BillingProductState): value is BillingProductState {
  return 'productKey' in value;
}

function normalizeCasdoorPlan(plan: BillingCasdoorPlanDetail): BillingItem {
  return {
    key: plan.name,
    kind: 'subscription',
    title: plan.displayName || plan.name,
    description: plan.description,
    priceLabel: typeof plan.price === 'number' ? `${plan.currency ? `${plan.currency} ` : ''}${plan.price}` : undefined,
    priceValue: typeof plan.price === 'number' ? plan.price : undefined,
    backendRef: {
      productId: plan.product || plan.name,
      planId: plan.name,
    },
    metadata: {
      owner: plan.owner,
      planName: plan.name,
      product: plan.product || '',
    },
  };
}

function normalizeCatalogProduct(product: BillingItem): BillingProductState {
  return {
    productKey: product.key,
    productId: product.backendRef.productId,
    title: product.title,
    kind: 'product',
    creditGrant: product.creditGrant,
    creditRedeem: product.creditRedeem,
    providers: undefined,
    providerObjs: undefined,
  };
}
