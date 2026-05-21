import React, { useState } from 'react';
import { useAuthStore } from 'shared/authStore';
import { Card, CardHeader, Button, useToast } from 'shared/ui';
import '../styles.css';

export default function EditProfile({ onDone }) {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const { show } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    updateProfile({ name: name.trim() });
    setSaving(false);
    show('Profile updated successfully!', 'success');
    onDone();
  };

  return (
    <Card>
      <CardHeader
        title="Edit Profile"
        subtitle="Lazy loaded chunk — webpackChunkName: edit-profile"
      />
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label className="field-label" htmlFor="edit-name">Display Name</label>
          <input
            id="edit-name"
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="edit-email">Email (read-only)</label>
          <input
            id="edit-email"
            className="field-input"
            value={user?.email || ''}
            readOnly
            style={{ background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Button type="submit" disabled={saving || !name.trim()}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="secondary" onClick={onDone} type="button">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
