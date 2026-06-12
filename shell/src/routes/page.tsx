import React from 'react';
import { Link } from '@modern-js/runtime/router';
import { Helmet } from '@modern-js/runtime/head';

const PRODUCTS = [
  { to: '/accounts', icon: '💳', title: 'Tài khoản thanh toán', desc: 'Quản lý số dư, lịch sử giao dịch theo thời gian thực.' },
  { to: '/transfer', icon: '💸', title: 'Chuyển tiền 24/7', desc: 'Chuyển khoản nội bộ và liên ngân hàng, miễn phí trọn đời.' },
  { to: '/cards',    icon: '🪪', title: 'Thẻ tín dụng & ghi nợ', desc: 'Mở thẻ online, hoàn tiền đến 2% cho mọi chi tiêu.' },
  { to: '/loans',    icon: '🏠', title: 'Vay vốn linh hoạt', desc: 'Vay tiêu dùng, vay mua nhà lãi suất từ 6.8%/năm.' },
];

// Trang public — SSR đầy đủ nội dung phục vụ SEO (bot thấy HTML hoàn chỉnh).
export default function HomePage() {
  return (
    <div className="landing">
      <Helmet>
        <title>VietBank — Ngân hàng số: tài khoản, chuyển tiền, thẻ, vay vốn</title>
        <meta
          name="description"
          content="Mở tài khoản VietBank miễn phí: chuyển tiền 24/7 không mất phí, thẻ hoàn tiền 2%, vay vốn lãi suất từ 6.8%/năm. Đăng nhập ngân hàng số ngay."
        />
      </Helmet>

      <section style={{ textAlign: 'center', padding: '48px 16px 32px' }}>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>Ngân hàng số VietBank</h1>
        <p style={{ color: '#64748b', maxWidth: 520, margin: '0 auto 24px' }}>
          Tài khoản, chuyển tiền, thẻ và vay vốn — tất cả trong một nền tảng,
          xây dựng theo kiến trúc micro-frontend với Modern.js federated SSR.
        </p>
        <Link
          to="/login"
          style={{
            display: 'inline-block', padding: '12px 32px', borderRadius: 10,
            background: '#2563eb', color: '#fff', fontWeight: 600, textDecoration: 'none',
          }}
        >
          Đăng nhập ngay
        </Link>
      </section>

      <section
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16, maxWidth: 960, margin: '0 auto', padding: '0 16px 48px',
        }}
      >
        {PRODUCTS.map(({ to, icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            style={{
              padding: 20, borderRadius: 14, border: '1px solid #e2e8f0',
              textDecoration: 'none', color: 'inherit', background: '#fff',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
            <h2 style={{ fontSize: 16, marginBottom: 6 }}>{title}</h2>
            <p style={{ fontSize: 13, color: '#64748b' }}>{desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
