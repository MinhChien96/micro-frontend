import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageSpinner, Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = { title: 'UI/Spinner', component: Spinner };
export default meta;
type Story = StoryObj<typeof Spinner>;

export const Small: Story = { args: { size: 'sm' } };
export const Medium: Story = { args: { size: 'md' } };
export const Large: Story = { args: { size: 'lg' } };
export const Page: StoryObj<typeof PageSpinner> = {
  render: () => <PageSpinner label="Đang tải..." />,
};
