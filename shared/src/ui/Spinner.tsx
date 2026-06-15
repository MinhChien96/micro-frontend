const PX = { sm: 16, md: 32, lg: 48 } as const;

interface SpinnerProps {
  size?: keyof typeof PX;
  color?: string;
}

export function Spinner({ size = 'md', color = '#667eea' }: SpinnerProps) {
  const px = PX[size];
  const border = Math.max(2, Math.round(px / 8));
  return (
    <span role="status" className="inline-flex items-center">
      <span
        className="inline-block shrink-0 animate-spin rounded-full"
        style={{
          width: px,
          height: px,
          borderWidth: border,
          borderStyle: 'solid',
          borderColor: `${color}33`,
          borderTopColor: color,
        }}
      />
    </span>
  );
}

export function PageSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <p className="m-0 text-sm text-text-muted">{label}</p>
    </div>
  );
}
