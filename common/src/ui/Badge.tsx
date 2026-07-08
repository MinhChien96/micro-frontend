interface BadgeProps {
  count?: number | null;
  max?: number;
  color?: string;
  size?: 'sm' | 'md';
}

export function Badge({ count, max = 99, color = '#ef4444', size = 'sm' }: BadgeProps) {
  if (count == null || count === 0) return null;
  const display = count > max ? `${max}+` : count;
  const isSmall = size === 'sm';
  return (
    <span
      className={`inline-block rounded-full text-center font-bold leading-tight text-white ${
        isSmall ? 'min-w-[18px] px-1.5 py-px text-[11px]' : 'min-w-[24px] px-2.5 py-0.5 text-[13px]'
      }`}
      style={{ backgroundColor: color }}
    >
      {display}
    </span>
  );
}

type StatusColor = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';

const STATUS_COLORS: Record<StatusColor, string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-slate-100 text-slate-600',
  purple: 'bg-purple-100 text-violet-600',
};

interface StatusBadgeProps {
  label: string;
  // chấp nhận string (vd 'default' từ domain code) → fallback blue
  color?: string;
}

export function StatusBadge({ label, color = 'blue' }: StatusBadgeProps) {
  const scheme = STATUS_COLORS[color as StatusColor] ?? STATUS_COLORS.blue;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${scheme}`}>
      {label}
    </span>
  );
}
