import { BRAND } from '@app/common/brand';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Nav from './Nav';

// useAuth không có provider → default {user:null} → Nav render trạng thái logged-out
function renderNav() {
  return render(
    <MemoryRouter>
      <Nav />
    </MemoryRouter>,
  );
}

describe('Nav', () => {
  it('hiển thị brand name từ BRAND config', () => {
    renderNav();
    expect(screen.getByText(BRAND.name)).toBeInTheDocument();
  });

  it('logged-out: hiện link Đăng nhập', () => {
    renderNav();
    expect(screen.getByText('Đăng nhập')).toBeInTheDocument();
  });

  it('có đủ link điều hướng MFE', () => {
    renderNav();
    expect(screen.getByText('Tài khoản')).toBeInTheDocument();
    expect(screen.getByText('Chuyển tiền')).toBeInTheDocument();
  });
});
