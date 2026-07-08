import { getUser, setUser } from '@app/common/auth';
import { Button, Card, CardHeader, useToast } from '@app/common/ui';
import { type FormEvent, useState } from 'react';
import '../styles.css';

export default function EditProfile({ onDone }: { onDone: () => void }) {
  const user = getUser();
  const { show } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    if (user) setUser({ ...user, name: name.trim() });
    window.dispatchEvent(new CustomEvent('auth:changed'));

    setSaving(false);
    show('Cập nhật hồ sơ thành công!', 'success');
    onDone();
  };

  return (
    <Card>
      <CardHeader title="Chỉnh sửa hồ sơ" subtitle="Lazy loaded — webpackChunkName: edit-profile" />
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label className="field-label" htmlFor="edit-name">
            Họ tên
          </label>
          <input
            id="edit-name"
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập họ tên"
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="edit-email">
            Email (chỉ đọc)
          </label>
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
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
          <Button variant="secondary" onClick={onDone} type="button">
            Huỷ
          </Button>
        </div>
      </form>
    </Card>
  );
}
