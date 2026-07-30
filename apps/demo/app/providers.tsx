'use client';

import type { ReactNode } from 'react';
import { AuthProvider, BillingProvider } from '@foldspace-fe/casdoor-next-auth-kit/react';
import {
  demoBillingApiClient,
  demoBillingRuntimeConfig,
} from '../lib/demo-billing';

export function DemoProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <BillingProvider
        apiClient={demoBillingApiClient}
        runtimeConfig={demoBillingRuntimeConfig}
        subscription={{
          subscriptionId: 'sub_demo_001',
          planKey: 'membership-monthly',
          planName: 'membership-monthly',
          status: 'active',
          interval: 'month',
          renewAt: '2026-08-30T08:00:00.000Z',
          currentPeriodStart: '2026-07-30T08:00:00.000Z',
          currentPeriodEnd: '2026-08-30T08:00:00.000Z',
          autoRenew: true,
        }}
        subscriptionHistory={[
          {
            subscriptionId: 'sub_demo_001',
            planKey: 'membership-monthly',
            planName: 'membership-monthly',
            status: 'active',
            interval: 'month',
            orderId: 'order_demo_sub_001',
            paymentId: 'pay_demo_sub_001',
            startedAt: '2026-07-30T08:00:00.000Z',
            updatedAt: '2026-07-30T08:00:00.000Z',
          },
        ]}
        products={[
          {
            productKey: 'credits-50',
            productId: 'demo/credits-50',
            title: '积分包 50',
            kind: 'product',
            status: 'active',
            quantity: 1,
            owned: true,
            creditsBalance: 50,
            updatedAt: '2026-07-30T08:00:00.000Z',
          },
        ]}
        orderHistory={[
          {
            orderId: 'order_demo_sub_001',
            productKey: 'membership-monthly',
            productId: 'demo/membership',
            productTitle: '会员月度计划',
            kind: 'subscription',
            quantity: 1,
            amount: 2900,
            currency: 'CNY',
            status: 'paid',
            paymentId: 'pay_demo_sub_001',
            transactionId: 'txn_demo_sub_001',
            createdAt: '2026-07-30T08:00:00.000Z',
            updatedAt: '2026-07-30T08:00:00.000Z',
          },
          {
            orderId: 'order_demo_credit_001',
            productKey: 'credits-50',
            productId: 'demo/credits-50',
            productTitle: '积分包 50',
            kind: 'product',
            quantity: 1,
            amount: 990,
            currency: 'CNY',
            status: 'paid',
            paymentId: 'pay_demo_credit_001',
            transactionId: 'txn_demo_credit_001',
            createdAt: '2026-07-30T08:00:00.000Z',
            updatedAt: '2026-07-30T08:00:00.000Z',
          },
        ]}
        paymentHistory={[
          {
            paymentId: 'pay_demo_sub_001',
            orderId: 'order_demo_sub_001',
            productKey: 'membership-monthly',
            amount: 2900,
            currency: 'CNY',
            status: 'paid',
            transactionId: 'txn_demo_sub_001',
            createdAt: '2026-07-30T08:00:00.000Z',
            updatedAt: '2026-07-30T08:00:00.000Z',
          },
          {
            paymentId: 'pay_demo_credit_001',
            orderId: 'order_demo_credit_001',
            productKey: 'credits-50',
            amount: 990,
            currency: 'CNY',
            status: 'paid',
            transactionId: 'txn_demo_credit_001',
            createdAt: '2026-07-30T08:00:00.000Z',
            updatedAt: '2026-07-30T08:00:00.000Z',
          },
        ]}
        credits={{
          balance: 2580,
          used: 420,
          reserved: 0,
          unit: 'credits',
          updatedAt: '2026-07-30T08:00:00.000Z',
        }}
        entitlements={{
          features: ['billing-dashboard', 'subscription-management', 'credits-purchase'],
          limits: {
            seats: 10,
            apiCallsPerDay: 250000,
          },
          flags: {
            hasActiveSubscription: true,
            hasCredits: true,
          },
        }}
        status={{
          loading: false,
          refreshing: false,
          error: null,
          lastFetchedAt: '2026-07-30T08:00:00.000Z',
        }}
        purchaseStatus={{
          status: 'paid',
          orderId: 'order_demo_credit_001',
          paymentId: 'pay_demo_credit_001',
          transactionId: 'txn_demo_credit_001',
          orderStatus: 'paid',
          paymentStatus: 'paid',
          transactionStatus: 'paid',
          updatedAt: '2026-07-30T08:00:00.000Z',
        }}
        autoRefresh={false}
      >
        {children}
      </BillingProvider>
    </AuthProvider>
  );
}
