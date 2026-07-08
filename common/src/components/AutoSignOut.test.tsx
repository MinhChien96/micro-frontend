import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AutoSignOutProvider } from './AutoSignOut';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('AutoSignOutProvider', () => {
  it('idle quá timeout → hiện modal cảnh báo, đếm ngược xong → onSignOut', () => {
    const onSignOut = vi.fn();
    render(
      <AutoSignOutProvider timeoutMs={1000} countdownSec={3} onSignOut={onSignOut}>
        <div>app</div>
      </AutoSignOutProvider>,
    );

    expect(screen.queryByText(/Phiên sắp hết hạn/)).toBeNull();

    act(() => vi.advanceTimersByTime(1100));
    expect(screen.getByText(/Phiên sắp hết hạn/)).toBeInTheDocument();
    expect(onSignOut).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(3100));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('bấm "Tiếp tục phiên" → đóng modal, reset timer', () => {
    const onSignOut = vi.fn();
    render(
      <AutoSignOutProvider timeoutMs={1000} countdownSec={30} onSignOut={onSignOut}>
        <div>app</div>
      </AutoSignOutProvider>,
    );

    act(() => vi.advanceTimersByTime(1100));
    expect(screen.getByText(/Phiên sắp hết hạn/)).toBeInTheDocument();

    act(() => {
      screen.getByText('Tiếp tục phiên').click();
    });
    expect(screen.queryByText(/Phiên sắp hết hạn/)).toBeNull();
    expect(onSignOut).not.toHaveBeenCalled();

    // idle tiếp → cảnh báo lại (timer đã reset)
    act(() => vi.advanceTimersByTime(1100));
    expect(screen.getByText(/Phiên sắp hết hạn/)).toBeInTheDocument();
  });

  it('hoạt động (keydown) trước timeout → không hiện cảnh báo', () => {
    const onSignOut = vi.fn();
    render(
      <AutoSignOutProvider timeoutMs={1000} countdownSec={30} onSignOut={onSignOut}>
        <div>app</div>
      </AutoSignOutProvider>,
    );

    act(() => vi.advanceTimersByTime(800));
    act(() => {
      window.dispatchEvent(new Event('keydown'));
    });
    act(() => vi.advanceTimersByTime(800));
    expect(screen.queryByText(/Phiên sắp hết hạn/)).toBeNull();
  });
});
