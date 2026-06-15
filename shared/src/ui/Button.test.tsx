import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('render children + type mặc định button', () => {
    render(<Button>Bấm</Button>);
    const btn = screen.getByRole('button', { name: 'Bấm' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('gọi onClick khi bấm', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Bấm</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('disabled không gọi onClick', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Bấm
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
