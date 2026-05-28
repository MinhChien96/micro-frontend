import React, { useEffect, useState } from 'react';
import { useManifest } from '../ManifestContext';

/**
 * Enterprise pattern: Service Discovery Dashboard.
 * In polyrepo, this panel gives shell operators visibility into
 * all registered MFEs — versions, teams, health, enabled status.
 *
 * Activate: add ?registry=1 to the URL, or press Shift+R
 */

const TEAM_COLORS = {
  'platform-team':  '#6366f1',
  'accounts-team':  '#0ea5e9',
  'payments-team':  '#f59e0b',
  'cards-team':     '#10b981',
  'lending-team':   '#8b5cf6',
};

function teamColor(team) {
  return TEAM_COLORS[team] ?? '#94a3b8';
}

export default function RegistryPanel({ onClose }) {
  const { manifest, loading } = useManifest() ?? {};
  const [health, setHealth] = useState({});

  // Probe each remote's remoteEntry.js to check liveness
  useEffect(() => {
    if (!manifest?.remotes) return;
    const isDev = import.meta.env.DEV;
    Object.entries(manifest.remotes).forEach(([name, meta]) => {
      const url = isDev ? meta.localUrl : meta.url;
      const start = Date.now();
      fetch(url, { method: 'HEAD', mode: 'no-cors' })
        .then(() => setHealth((h) => ({ ...h, [name]: { ok: true, ms: Date.now() - start } })))
        .catch(() => setHealth((h) => ({ ...h, [name]: { ok: false } })));
    });
  }, [manifest]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 780,
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
      }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
              MFE Registry
            </h2>
            {manifest && (
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                Shell v{manifest.shellVersion} · Schema v{manifest.schemaVersion} · Generated {new Date(manifest.generated).toLocaleDateString('vi-VN')}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#64748b',
          }}>
            Đóng ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 24px 24px' }}>
          {loading ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>
              Đang tải manifest...
            </p>
          ) : !manifest?.remotes || Object.keys(manifest.remotes).length === 0 ? (
            <p style={{ color: '#ef4444', textAlign: 'center', padding: 40 }}>
              Không tải được manifest. Shell đang chạy ở chế độ fail-open.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(manifest.remotes).map(([name, meta]) => {
                const h = health[name];
                return (
                  <div key={name} style={{
                    border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px',
                    display: 'grid', gridTemplateColumns: '1fr auto',
                    gap: 12, alignItems: 'center',
                    opacity: meta.enabled ? 1 : 0.5,
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontWeight: 700, fontSize: 14, color: '#0f172a',
                          fontFamily: 'monospace',
                        }}>
                          {name}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '1px 7px',
                          borderRadius: 20, background: meta.enabled ? '#dcfce7' : '#fee2e2',
                          color: meta.enabled ? '#15803d' : '#b91c1c',
                        }}>
                          {meta.enabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                        <span style={{
                          fontSize: 11, padding: '1px 7px', borderRadius: 20,
                          background: `${teamColor(meta.team)}18`,
                          color: teamColor(meta.team), fontWeight: 600,
                        }}>
                          {meta.team}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                        {meta.description}
                      </p>
                      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8' }}>
                        <span>v{meta.version}</span>
                        <span>min shell: v{meta.minShellVersion}</span>
                        <span>{meta.contact}</span>
                      </div>
                    </div>

                    {/* Health indicator */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {h === undefined ? (
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>Probing…</span>
                      ) : h.ok ? (
                        <div>
                          <div style={{
                            display: 'inline-block', width: 8, height: 8,
                            borderRadius: '50%', background: '#22c55e',
                            boxShadow: '0 0 6px #22c55e', marginRight: 6,
                          }} />
                          <span style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>
                            LIVE {h.ms ? `${h.ms}ms` : ''}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div style={{
                            display: 'inline-block', width: 8, height: 8,
                            borderRadius: '50%', background: '#ef4444', marginRight: 6,
                          }} />
                          <span style={{ fontSize: 11, color: '#b91c1c', fontWeight: 600 }}>
                            UNREACHABLE
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{
            marginTop: 20, padding: '12px 16px', borderRadius: 10,
            background: '#f8fafc', border: '1px dashed #cbd5e1',
            fontSize: 12, color: '#64748b', lineHeight: 1.6,
          }}>
            <strong style={{ color: '#0f172a' }}>Enterprise pattern:</strong> Trong kiến trúc polyrepo thực tế,
            mỗi team deploy MFE của mình lên CDN riêng và cập nhật manifest này.
            Shell đọc manifest lúc runtime → không cần rebuild shell khi MFE thay đổi URL hay version.
            Tắt MFE bằng cách set <code>enabled: false</code> trong manifest → deploy manifest → không cần rebuild gì cả.
          </div>
        </div>
      </div>
    </div>
  );
}

/** Hook để mở RegistryPanel bằng Shift+R */
export function useRegistryPanelToggle() {
  const [open, setOpen] = useState(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('registry') === '1'
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.shiftKey && e.key === 'R') setOpen((v) => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return [open, setOpen];
}
