import React from 'react';
import { Card, CardHeader, Divider, StatusBadge, Button } from 'shared/ui';

export default function OrderDetail({ order, onBack }) {
  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = order.status === 'cancelled' ? 0 : 9.99;

  return (
    <div>
      <Card>
        <CardHeader
          title={order.id}
          subtitle={`Placed on ${order.date}`}
          action={<StatusBadge label={order.status} color={order.statusColor} />}
        />
        <Divider />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 28 }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Qty: {item.qty}</div>
              </div>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>
                ${(item.price * item.qty).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <Divider />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
          <SummaryRow label="Shipping" value={shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`} />
          <Divider margin={4} />
          <SummaryRow
            label="Total"
            value={`$${order.total.toFixed(2)}`}
            bold
          />
        </div>

        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <>
            <Divider />
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" size="sm">Track Package</Button>
              <Button variant="danger" size="sm">Cancel Order</Button>
            </div>
          </>
        )}

        {order.status === 'delivered' && (
          <>
            <Divider />
            <Button variant="secondary" size="sm" icon="↩">Reorder</Button>
          </>
        )}
      </Card>

      <div style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'center', marginTop: 12 }}>
        Lazy loaded chunk — webpackChunkName: order-detail
      </div>
    </div>
  );
}

function SummaryRow({ label, value, bold = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 16 : 14 }}>
      <span style={{ color: bold ? '#1e293b' : '#64748b', fontWeight: bold ? 700 : 400 }}>
        {label}
      </span>
      <span style={{ color: '#1e293b', fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  );
}
