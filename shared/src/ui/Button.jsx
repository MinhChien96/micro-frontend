import React from 'react';

const VARIANTS = {
  primary:   { background: '#667eea', color: '#fff',     border: 'none' },
  secondary: { background: '#f1f5f9', color: '#334155',  border: '1px solid #cbd5e1' },
  danger:    { background: '#ef4444', color: '#fff',     border: 'none' },
  ghost:     { background: 'transparent', color: '#667eea', border: '1px solid #667eea' },
  success:   { background: '#22c55e', color: '#fff',     border: 'none' },
};

const SIZES = {
  sm: { padding: '6px 12px',  fontSize: '13px', borderRadius: '6px' },
  md: { padding: '10px 20px', fontSize: '14px', borderRadius: '8px' },
  lg: { padding: '14px 28px', fontSize: '16px', borderRadius: '10px' },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  icon,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...VARIANTS[variant] || VARIANTS.primary,
        ...SIZES[size] || SIZES.md,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        fontWeight: 500,
        lineHeight: 1,
        transition: 'opacity 0.15s, box-shadow 0.15s',
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
