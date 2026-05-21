import React, { useEffect } from 'react';

let keyframesInjected = false;
function injectKeyframes() {
  if (keyframesInjected || typeof document === 'undefined') return;
  keyframesInjected = true;
  const style = document.createElement('style');
  style.textContent = '@keyframes mfe-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

const PX = { sm: 16, md: 32, lg: 48 };

export function Spinner({ size = 'md', color = '#667eea' }) {
  useEffect(() => { injectKeyframes(); }, []);
  const px = PX[size] ?? PX.md;
  const border = Math.max(2, Math.round(px / 8));
  return (
    <span role="status" style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span style={{
        width: px,
        height: px,
        borderRadius: '50%',
        border: `${border}px solid ${color}33`,
        borderTopColor: color,
        display: 'inline-block',
        animation: 'mfe-spin 0.7s linear infinite',
        flexShrink: 0,
      }} />
    </span>
  );
}

export function PageSpinner({ label = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
      gap: 12,
    }}>
      <Spinner size="lg" />
      <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>{label}</p>
    </div>
  );
}
