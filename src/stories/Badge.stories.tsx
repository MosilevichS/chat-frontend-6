import type { Meta, StoryObj } from '@storybook/react';
import Badge from '../components/ui/Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Простые истории
export const ОднозначноеЧисло: Story = {
  args: { count: 5 },
};

export const ДвузначноеЧисло: Story = {
  args: { count: 15 },
};

export const Превышение999: Story = {
  args: { count: 1500 },
};

export const СТекстом: Story = {
  render: () => <Badge>New</Badge>,
};

export const ВсеВарианты: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Badge count={3} />
      <Badge count={12} />
      <Badge count={99} />
      <Badge count={150} />
      <Badge>VIP</Badge>
    </div>
  ),
};