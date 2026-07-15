import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ReviewCard } from '../index';
import { Comment } from '@mfe/shared-types';

const meta: Meta<typeof ReviewCard> = {
  title: 'Components/ReviewCard',
  component: ReviewCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReviewCard>;

const mockComment: Comment = {
  id: 'c1',
  productId: 1,
  uid: 'u1',
  userName: 'John Doe',
  message: 'This product exceeded my expectations! The build quality is top-notch and sound fidelity is unparalleled.',
  createdAt: new Date().toISOString(),
};

export const Default: Story = {
  args: {
    comment: mockComment,
  },
};
