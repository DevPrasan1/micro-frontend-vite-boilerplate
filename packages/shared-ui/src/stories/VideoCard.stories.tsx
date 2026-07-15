import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VideoCard } from '../index';

const meta = {
  title: 'Shared UI/VideoCard',
  component: VideoCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof VideoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockChannel = {
  id: 'Fl6HC6dMqHc',
  name: 'घुंघरू सेठ भगवान का दिया सबकुछ है.. वेलकम बैक',
  url: 'https://www.youtube.com/watch?v=Fl6HC6dMqHc',
  logo: 'https://i.ytimg.com/vi/Fl6HC6dMqHc/hqdefault.jpg',
  category: 'Nana Patekar',
  country: 'IN',
  language: 'hi',
  description: 'Welcome Back (2015) movie comedy clips featuring Nana Patekar and Anil Kapoor.',
  channelTitle: 'Shemaroo Comedy',
  channelUrl: 'https://www.youtube.com/@shemaroobollywoodcomedy',
  channelId: 'UC0PKLLmL8pIJLjOI1gBH_pA',
  position: 1,
  videoTitle: 'घुंघरू सेठ भगवान का दिया सबकुछ है.. वेलकम बैक',
  videoUrl: 'https://www.youtube.com/watch?v=Fl6HC6dMqHc',
  videoId: 'Fl6HC6dMqHc',
  publishDate: '2026-07-14T13:00:30Z',
  duration: '13:38',
  views: 6369,
  thumbnailUrl: 'https://i.ytimg.com/vi/Fl6HC6dMqHc/hqdefault.jpg',
  availabilityStatus: 'available',
};

export const Default: Story = {
  args: {
    channel: mockChannel,
    onClick: (channel) => console.log('Clicked channel:', channel),
  },
};
