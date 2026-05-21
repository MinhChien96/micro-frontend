import React, { Suspense, lazy, useState } from 'react';
import { useAuthStore } from 'shared/authStore';
import { Card, CardHeader, Divider, Button, PageSpinner, StatusBadge } from 'shared/ui';
import '../styles.css';

const EditProfile = lazy(() =>
  import(
    /* webpackChunkName: "edit-profile" */
    /* webpackPrefetch: true */
    './EditProfile'
  )
);

const ROLE_COLOR = { admin: 'purple', user: 'blue', guest: 'gray' };

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [editing, setEditing] = useState(false);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
        <p style={{ fontSize: 16, marginBottom: 20 }}>Please login to view your profile</p>
        <p style={{ fontSize: 13 }}>
          Go to <strong>Login</strong> to authenticate
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 8, fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
        MFE-PROFILE TEAM
      </div>
      <h2 style={{ margin: '0 0 24px', color: '#1e293b', fontSize: 24 }}>My Profile</h2>

      <Card>
        <CardHeader
          title={user.name}
          subtitle={user.email}
          action={
            <StatusBadge
              label={user.role || 'user'}
              color={ROLE_COLOR[user.role] || 'blue'}
            />
          }
        />
        <Divider />

        <div style={{ display: 'grid', gap: 12 }}>
          <InfoRow label="Full Name" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Role" value={user.role || 'user'} />
          <InfoRow label="Member Since" value="May 2024" />
        </div>

        <Divider />

        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant={editing ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? 'Cancel Edit' : 'Edit Profile'}
          </Button>
        </div>
      </Card>

      {editing && (
        <div style={{ marginTop: 20 }}>
          <Suspense fallback={<PageSpinner label="Loading editor..." />}>
            <EditProfile onDone={() => setEditing(false)} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{ width: 120, fontSize: 13, color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: '#1e293b' }}>{value}</span>
    </div>
  );
}
