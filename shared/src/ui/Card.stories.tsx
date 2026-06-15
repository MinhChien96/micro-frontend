import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardHeader, Divider } from './Card';

const meta: Meta<typeof Card> = { title: 'UI/Card', component: Card };
export default meta;
type Story = StoryObj<typeof Card>;

export const Basic: Story = {
  render: () => (
    <Card>
      <CardHeader title="Tiêu đề thẻ" subtitle="Phụ đề" />
      <Divider />
      <p className="text-sm text-text-muted">Nội dung card mẫu.</p>
    </Card>
  ),
};

export const Hoverable: Story = {
  render: () => (
    <Card hoverable>
      <CardHeader>Card có hover</CardHeader>
      <p className="text-sm text-text-muted">Di chuột để thấy hiệu ứng.</p>
    </Card>
  ),
};
