import { type CSSProperties, type MouseEvent, type ReactNode, useState } from 'react';

const PADDING = { sm: 12, md: 20, lg: 32 } as const;

interface CardProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  hoverable?: boolean;
  padding?: keyof typeof PADDING;
  style?: CSSProperties;
}

export function Card({
  children,
  onClick,
  hoverable = false,
  padding = 'md',
  style: extra,
}: CardProps) {
  const [hovered, setHovered] = useState(false);
  const pad = PADDING[padding] ?? PADDING.md;
  const active = hoverable && hovered;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: card tùy chọn clickable, không phải control chính
    // biome-ignore lint/a11y/noStaticElementInteractions: wrapper trình bày, hành vi do onClick caller quyết định
    <div
      onClick={onClick}
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: pad,
        boxShadow: active ? '0 8px 24px rgba(102, 126, 234, 0.18)' : '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
        transition: 'box-shadow 0.2s, transform 0.2s',
        transform: active ? 'translateY(-2px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...extra,
      }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  /** Mode 1: heading có cấu trúc (title + subtitle + action) */
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  /** Mode 2: heading đơn giản — truyền text/markup làm children */
  children?: ReactNode;
  style?: CSSProperties;
}

export function CardHeader({ title, subtitle, action, children, style }: CardHeaderProps) {
  // Mode 2: children → render heading đơn giản
  if (children != null) {
    return (
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b', ...style }}>
        {children}
      </h3>
    );
  }

  // Mode 1: title/subtitle/action
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 12,
        ...style,
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{title}</h3>
        {subtitle && (
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>{subtitle}</p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

export function Divider({ margin = 16 }: { margin?: number }) {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: '1px solid #f1f5f9',
        margin: `${margin}px 0`,
      }}
    />
  );
}
