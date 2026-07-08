import { BRAND } from '@app/common/brand';
import { clearAuthState, setGlobalUser } from '@app/common/stores';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Nav from './Nav';

// Nav chỉ render trong PrivateLayout → luôn có user trong global store
beforeEach(() => {
  setGlobalUser({ name: 'Nguyễn Test', role: 'PREMIUM' });
});
afterEach(() => {
  clearAuthState();
});

function renderNav(onLogout = vi.fn()) {
  return render(
    <MemoryRouter>
      <Nav onLogout={onLogout} />
    </MemoryRouter>,
  );
}

describe('Nav', () => {
  it('hiển thị brand name từ BRAND config', () => {
    renderNav();
    expect(screen.getByText(BRAND.name)).toBeInTheDocument();
  });

  it('hiển thị user + nút đăng xuất', () => {
    renderNav();
    expect(screen.getByText('Nguyễn Test')).toBeInTheDocument();
    expect(screen.getByText('Đăng xuất')).toBeInTheDocument();
  });

  it('có đủ link điều hướng MFE (render từ constants/menu.ts)', () => {
    renderNav();
    expect(screen.getByText('Tài khoản')).toBeInTheDocument();
    expect(screen.getByText('Chuyển tiền')).toBeInTheDocument();
    expect(screen.getByText('Thẻ')).toBeInTheDocument();
    expect(screen.getByText('Vay vốn')).toBeInTheDocument();
  });
});
