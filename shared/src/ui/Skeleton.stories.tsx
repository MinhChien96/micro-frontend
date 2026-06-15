import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkeletonCard, SkeletonList, SkeletonRow } from './Skeleton';

const meta: Meta = { title: 'UI/Skeleton' };
export default meta;
type Story = StoryObj;

export const Card: Story = { render: () => <SkeletonCard /> };
export const Row: Story = { render: () => <SkeletonRow /> };
export const List: Story = { render: () => <SkeletonList rows={4} /> };
