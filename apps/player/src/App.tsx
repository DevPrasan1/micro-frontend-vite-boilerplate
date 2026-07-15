import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { usePlayerStore } from '@streamhub/shared-store';

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
  const { selectedChannel, volume, isPlaying, playbackRate, setVolume, setIsPlaying, setPlaybackRate } = usePlayerStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stats, setStats] = useState({ buffered: 0, droppedFrames: 0 });
  const [streamError, setStreamError] = useState<string | null>(null);

  const youtubeEmbedUrl = getYoutubeEmbedUrl(selectedChannel?.url || '');
  const isYoutube = !!youtubeEmbedUrl;

  // Auto-play whenever selected channel changes
  useEffect(() => {
    if (selectedChannel?.url) {
      setStreamError(null);
      setIsPlaying(true);
    }
  }, [selectedChannel?.url, setIsPlaying]);

  useEffect(() => {
    if (isYoutube) return; // Skip Hls/HTML5 setup for YouTube

    const video = videoRef.current;
    if (!video || !selectedChannel?.url) return;

    let hls: Hls | null = null;

    const handlePlaybackError = () => {
      setStreamError('Stream not available');
      setIsPlaying(false);
    };

    let networkRetryCount = 0;

    if (Hls.isSupported() && selectedChannel.url.includes('.m3u8')) {
      hls = new Hls();
      hls.loadSource(selectedChannel.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying) {
          video.play().catch(() => {
            // Autoplay blocked by browser policy - retry muted
            video.muted = true;
            video.play().catch((err) => console.log('Autoplay blocked completely:', err));
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (
          data.response?.code === 404 ||
          data.response?.code === 403 ||
          data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
          data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR
        ) {
          handlePlaybackError();
          return;
        }

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (networkRetryCount >= 3) {
                console.error('Failed to recover from HLS network errors after 3 attempts.');
                handlePlaybackError();
              } else {
                networkRetryCount++;
                console.warn(`HLS network error, attempting recovery (${networkRetryCount}/3)...`);
                hls?.startLoad();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS media error, attempting recovery...');
              hls?.recoverMediaError();
              break;
            default:
              console.error('HLS fatal error, cannot recover.');
              handlePlaybackError();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = selectedChannel.url;
      video.addEventListener('loadedmetadata', () => {
        if (isPlaying) {
          video.play().catch(() => {
            // Autoplay blocked by browser policy - retry muted
            video.muted = true;
            video.play().catch((err) => console.log('Autoplay blocked completely:', err));
          });
        }
      });
      video.addEventListener('error', handlePlaybackError);
    } else {
      video.src = selectedChannel.url;
      video.addEventListener('error', handlePlaybackError);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      video.removeEventListener('error', handlePlaybackError);
    };
  }, [selectedChannel?.url, isYoutube]);

  useEffect(() => {
    if (isYoutube) return; // Skip play/pause control hook for YouTube (it uses standard iframe controls)

    const video = videoRef.current;
    if (!video || streamError) return;

    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isPlaying, streamError, setIsPlaying, isYoutube]);

  useEffect(() => {
    if (isYoutube) return;
    const video = videoRef.current;
    if (video) video.volume = volume;
  }, [volume, isYoutube]);

  useEffect(() => {
    if (isYoutube) return;
    const video = videoRef.current;
    if (video) video.playbackRate = playbackRate;
  }, [playbackRate, isYoutube]);

  useEffect(() => {
    if (isYoutube) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;
      
      let bufferedTime = 0;
      if (video.buffered.length > 0) {
        bufferedTime = video.buffered.end(video.buffered.length - 1) - video.currentTime;
      }
      
      const quality = (video as any).getVideoPlaybackQuality?.();
      const dropped = quality ? quality.droppedVideoFrames : 0;

      setStats({
        buffered: Math.round(bufferedTime),
        droppedFrames: dropped
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isYoutube]);

  const handlePlayPause = () => {
    if (streamError || isYoutube) return;
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (video) {
      if (video.requestFullscreen) video.requestFullscreen();
      else if ((video as any).webkitRequestFullscreen) (video as any).webkitRequestFullscreen();
    }
  };

  if (!selectedChannel) {
    return (
      <div className="aspect-video bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800 text-zinc-500">
        No channel selected
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Video Container */}
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden group border border-zinc-800 shadow-2xl">
        {isYoutube && youtubeEmbedUrl ? (
          <iframe
            src={youtubeEmbedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              onClick={handlePlayPause}
            />

            {/* Error Overlay */}
            {streamError && (
              <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center text-center p-6 z-20 rounded-xl">
                <span className="text-4xl mb-4">⚠️</span>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">Live Stream Offline</h3>
                <p className="text-sm text-zinc-400 max-w-xs mb-6">{streamError}</p>
                <button 
                  onClick={() => {
                    setStreamError(null);
                    setIsPlaying(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-medium text-sm shadow-md"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Video Overlay Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePlayPause}
                    className="text-white hover:text-indigo-400 transition"
                    disabled={!!streamError}
                  >
                    {isPlaying ? (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  <div className="flex items-center gap-2 text-white">
                    <span>🔊</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={playbackRate}
                    onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                    className="bg-black/60 text-white border border-zinc-700 rounded px-2 py-1 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="0.5">0.5x</option>
                    <option value="1">1.0x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2.0x</option>
                  </select>

                  <button
                    onClick={handleFullscreen}
                    className="text-white hover:text-indigo-400 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Playback Statistics */}
      {!isYoutube && (
        <div className="grid grid-cols-2 gap-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-400">
          <div>
            <span className="font-semibold text-zinc-300">Buffer state:</span> {stats.buffered}s remaining
          </div>
          <div>
            <span className="font-semibold text-zinc-300">Dropped frames:</span> {stats.droppedFrames}
          </div>
        </div>
      )}
    </div>
  );
}
