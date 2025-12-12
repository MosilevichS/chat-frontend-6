import type { Meta, StoryObj } from "@storybook/react";
import Badge from "../components/ui/Badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Цифра1: Story = {
  args: {
    children: 1,
  },
};

export const Цифра5: Story = {
  args: {
    children: 5,
  },
};

export const Цифра9: Story = {
  args: {
    children: 9,
  },
};

export const Число10: Story = {
  args: {
    children: 10,
  },
};

export const Число25: Story = {
  args: {
    children: 25,
  },
};

export const Число99: Story = {
  args: {
    children: 99,
  },
};

export const Число100: Story = {
  args: {
    children: 100,
  },
};

export const ТекстNew: Story = {
  args: {
    children: "New",
  },
};

export const ТекстVIP: Story = {
  args: {
    children: "VIP",
  },
};

export const ВсеВарианты: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <Badge>1</Badge>
      <Badge>5</Badge>
      <Badge>9</Badge>
      <Badge>10</Badge>
      <Badge>25</Badge>
      <Badge>99</Badge>
      <Badge>100</Badge>
      <Badge>New</Badge>
      <Badge>VIP</Badge>
    </div>
  ),
};
