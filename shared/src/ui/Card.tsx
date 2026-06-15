import type { CSSProperties, MouseEvent, ReactNode } from 'react';

const PADDING = { sm: 'p-3', md: 'p-5', lg: 'p-8' } as const;

interface CardProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  hoverable?: boolean;
  padding?: keyof typeof PADDING;
  style?: CSSProperties;
}

export function Card({ children, onClick, hoverable = false, padding = 'md', style }: CardProps) {
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: card tùy chọn clickable, không phải control chính
    // biome-ignore lint/a11y/noStaticElementInteractions: wrapper trình bày, hành vi do onClick caller quyết định
    <div
      onClick={onClick}
      className={`rounded-xl border border-border bg-bg-card shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition ${PADDING[padding]} ${
        hoverable ? 'hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(102,126,234,0.18)]' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

export function CardHeader({ title, subtitle, action, children, style }: CardHeaderProps) {
  // Mode 2: children → heading đơn giản
  if (children != null) {
    return (
      <h3 className="m-0 text-lg font-bold text-text-main" style={style}>
        {children}
      </h3>
    );
  }

  // Mode 1: title/subtitle/action
  return (
    <div className="mb-4 flex items-start justify-between gap-3" style={style}>
      <div>
        <h3 className="m-0 text-lg font-bold text-text-main">{title}</h3>
        {subtitle && <p className="mt-1 mb-0 text-[13px] text-text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Divider({ margin = 16 }: { margin?: number }) {
  return <hr className="border-0 border-t border-border" style={{ margin: `${margin}px 0` }} />;
}
