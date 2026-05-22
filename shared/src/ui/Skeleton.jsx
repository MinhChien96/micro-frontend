import React from 'react';

const SHIMMER_CSS = `@keyframes vb-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
let cssInjected = false;
function ensureCSS() {
  if (cssInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = SHIMMER_CSS;
  document.head.appendChild(el);
  cssInjected = true;
}
ensureCSS();

const shimmer = {
  background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
  backgroundSize: '200% 100%',
  animation: 'vb-shimmer 1.5s infinite',
  borderRadius: 6,
};

export function SkeletonCard() {
  return (
    <div style={{ padding: 16, border: '1px solid #f1f5f9', borderRadius: 12 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ ...shimmer, width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...shimmer, height: 14, width: '60%', marginBottom: 8 }} />
          <div style={{ ...shimmer, height: 11, width: '40%' }} />
        </div>
        <div style={{ ...shimmer, height: 18, width: 80 }} />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ padding: '10px 12px', border: '1px solid #f1f5f9', borderRadius: 8 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ ...shimmer, width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...shimmer, height: 13, width: '55%', marginBottom: 6 }} />
          <div style={{ ...shimmer, height: 11, width: '30%' }} />
        </div>
        <div style={{ ...shimmer, height: 15, width: 70 }} />
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: rows }, (_, i) => <SkeletonRow key={i} />)}
    </div>
  );
}
