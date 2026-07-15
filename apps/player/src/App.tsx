import React from 'react';
import { usePlayerStore } from '@mfe/shared-store';

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0`;
  }
  return null;
}

export default function App() {
  const { selectedChannel } = usePlayerStore();

  if (!selectedChannel) {
    return (
      <div className="aspect-video bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800 text-zinc-500">
        No video selected
      </div>
    );
  }

  const youtubeEmbedUrl = getYoutubeEmbedUrl(selectedChannel.url);

  return (
    <div className="flex flex-col gap-4">
      {/* Video Container */}
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden group border border-zinc-800 shadow-2xl">
        {youtubeEmbedUrl ? (
          <iframe
            src={youtubeEmbedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-zinc-950">
            <span className="text-4xl mb-4">⚠️</span>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Invalid Video URL</h3>
            <p className="text-sm text-zinc-400 max-w-xs">This video does not have a valid YouTube link.</p>
          </div>
        )}
      </div>
    </div>
  );
}
