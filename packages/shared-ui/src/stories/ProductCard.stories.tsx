import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from '../index';
import { Product } from '@mfe/shared-types';

const meta: Meta<typeof ProductCard> = {
  title: 'Components/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

const mockProduct: Product = {
  id: 1,
  title: 'Premium Wireless Headphones',
  description: 'High-fidelity noise cancelling wireless headphones with 40-hour battery life.',
  price: 299.99,
  discountPercentage: 15,
  rating: 4.8,
  stock: 12,
  brand: 'AudioTech',
  category: 'electronics',
  thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&fit=crop&q=60',
  images: [],
};

export const Default: Story = {
  args: {
    product: mockProduct,
    onClick: (p) => alert(`Clicked product: ${p.title}`),
  },
};

export const OutOfStock: Story = {
  args: {
    product: {
      ...mockProduct,
      stock: 0,
    },
    onClick: (p) => alert(`Clicked product: ${p.title}`),
  },
};
