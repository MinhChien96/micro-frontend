import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { ToastProvider, useToast } from './Toast';

const meta: Meta = { title: 'UI/Toast' };
export default meta;
type Story = StoryObj;

function Demo() {
  const { show } = useToast();
  return (
    <div className="flex gap-2">
      <Button variant="success" onClick={() => show('Thành công!', 'success')}>
        Success
      </Button>
      <Button variant="danger" onClick={() => show('Có lỗi!', 'error')}>
        Error
      </Button>
      <Button variant="secondary" onClick={() => show('Thông tin', 'info')}>
        Info
      </Button>
    </div>
  );
}

export const Interactive: Story = {
  render: () => (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  ),
};
