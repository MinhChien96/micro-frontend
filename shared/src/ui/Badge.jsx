export function Badge({ count, max = 99, color = '#ef4444', size = 'sm' }) {
  if (count == null || count === 0) return null;
  const display = count > max ? `${max}+` : count;
  const isSmall = size === 'sm';
  return (
    <span
      style={{
        background: color,
        color: '#fff',
        borderRadius: '9999px',
        padding: isSmall ? '1px 6px' : '3px 10px',
        fontSize: isSmall ? '11px' : '13px',
        fontWeight: 700,
        lineHeight: 1.4,
        display: 'inline-block',
        minWidth: isSmall ? '18px' : '24px',
        textAlign: 'center',
      }}
    >
      {display}
    </span>
  );
}

const STATUS_COLORS = {
  blue: { background: '#dbeafe', color: '#1d4ed8' },
  green: { background: '#dcfce7', color: '#15803d' },
  yellow: { background: '#fef9c3', color: '#a16207' },
  red: { background: '#fee2e2', color: '#dc2626' },
  gray: { background: '#f1f5f9', color: '#475569' },
  purple: { background: '#f3e8ff', color: '#7c3aed' },
};

export function StatusBadge({ label, color = 'blue' }) {
  const scheme = STATUS_COLORS[color] || STATUS_COLORS.blue;
  return (
    <span
      style={{
        ...scheme,
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  );
}
