import React, { Suspense, lazy, useState } from 'react';
import { useAuthStore } from 'shared/authStore';
import { Card, CardHeader, Divider, StatusBadge, Badge, Button, PageSpinner } from 'shared/ui';
import '../styles.css';

const OrderDetail = lazy(() =>
  import(
    /* webpackChunkName: "order-detail" */
    /* webpackPrefetch: true */
    './OrderDetail'
  )
);

const MOCK_ORDERS = [
  {
    id: 'ORD-2024-001',
    date: '2024-05-15',
    status: 'delivered',
    statusColor: 'green',
    total: 149.97,
    items: [
      { name: 'Wireless Headphones', qty: 1, price: 79.99, emoji: '🎧' },
      { name: 'USB-C Hub',           qty: 2, price: 34.99, emoji: '🔌' },
    ],
  },
  {
    id: 'ORD-2024-002',
    date: '2024-05-18',
    status: 'in transit',
    statusColor: 'blue',
    total: 299.99,
    items: [
      { name: 'Mechanical Keyboard', qty: 1, price: 199.99, emoji: '⌨️' },
      { name: 'Mouse Pad XL',        qty: 1, price: 49.99,  emoji: '🖱️' },
      { name: 'Webcam HD',           qty: 1, price: 50.01,  emoji: '📷' },
    ],
  },
  {
    id: 'ORD-2024-003',
    date: '2024-05-20',
    status: 'processing',
    statusColor: 'yellow',
    total: 59.98,
    items: [
      { name: 'Phone Stand', qty: 2, price: 19.99, emoji: '📱' },
      { name: 'Cable Organizer', qty: 1, price: 19.99, emoji: '🗂️' },
    ],
  },
  {
    id: 'ORD-2024-004',
    date: '2024-04-30',
    status: 'cancelled',
    statusColor: 'red',
    total: 89.99,
    items: [
      { name: 'Smart Speaker', qty: 1, price: 89.99, emoji: '🔊' },
    ],
  },
];

export default function OrderList() {
  const user = useAuthStore((s) => s.user);
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
        <p style={{ fontSize: 16 }}>Please login to view your orders</p>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)} icon="←">
          Back to Orders
        </Button>
        <div style={{ height: 16 }} />
        <Suspense fallback={<PageSpinner label="Loading order detail..." />}>
          <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />
        </Suspense>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 8, fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
        MFE-ORDERS TEAM
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: 24 }}>Order History</h2>
        <Badge count={MOCK_ORDERS.length} color="#667eea" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {MOCK_ORDERS.map((order) => (
          <Card key={order.id} hoverable onClick={() => setSelectedOrder(order)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>
                    {order.id}
                  </span>
                  <StatusBadge label={order.status} color={order.statusColor} />
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>
                  {order.date} · {order.items.length} item{order.items.length > 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 17 }}>
                  ${order.total.toFixed(2)}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {order.items.map((i) => i.emoji).join(' ')}
                </div>
              </div>
            </div>
            <Divider margin={12} />
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Click to view details →
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
