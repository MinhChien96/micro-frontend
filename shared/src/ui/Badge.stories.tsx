import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBadge } from './Badge';

const meta: Meta<typeof StatusBadge> = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  args: { label: 'Hoạt động', color: 'green' },
};
export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Green: Story = { args: { color: 'green', label: 'Thành công' } };
export const Blue: Story = { args: { color: 'blue', label: 'Đang xử lý' } };
export const Red: Story = { args: { color: 'red', label: 'Thất bại' } };
export const Yellow: Story = { args: { color: 'yellow', label: 'Chờ duyệt' } };
