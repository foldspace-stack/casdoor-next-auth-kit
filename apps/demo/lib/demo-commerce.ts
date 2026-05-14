export const demoCommerceCatalog = {
  products: [
    { id: 'pro', name: 'Pro Plan', price: 19900, interval: 'month' },
    { id: 'team', name: 'Team Plan', price: 59900, interval: 'month' }
  ],
  subscriptions: [
    { id: 'sub_1', productId: 'pro', status: 'active' },
    { id: 'sub_2', productId: 'team', status: 'trialing' }
  ],
  orders: [
    { id: 'order_1', productId: 'pro', amount: 19900, status: 'paid' }
  ]
};
