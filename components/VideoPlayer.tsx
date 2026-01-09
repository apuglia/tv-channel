"use client";

import { useState, useEffect } from "react";

interface Channel {
  id: string;
  name: string;
  embedUrl: string;
  description: string;
  type: "youtube" | "website" | "iframe";
  fallbackUrl?: string;
}

// Mix of Venezuelan channels and US news networks
// Venezuelan YouTube streams only work when actively broadcasting
// ABC News has reliable 24/7 stream, others may require active broadcast
const CHANNELS: Channel[] = [
  {
    id: "globovision",
    name: "Globovisión",
    // Globovision - Venezuelan news, only when live
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCfJtBtmhnIyfUB6RqXeImMw&autoplay=1&mute=1",
    description: "Venezuela 24h",
    type: "youtube",
  },
  {
    id: "vtv",
    name: "VTV",
    // VTV main YouTube was suspended, using alternative/mirror
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCVHChtpTCDxHoL2oKYdj6Fw&autoplay=1&mute=1",
    description: "Canal 8",
    type: "youtube",
  },
  {
    id: "vpi",
    name: "VPItv",
    // VPI TV - Venezuelan, may not always be live
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCVFiIRuxJ2GmJLUkHmlmj4w&autoplay=1&mute=1",
    description: "Venezuela Press",
    type: "youtube",
  },
  {
    id: "foxnews",
    name: "Fox News",
    // Fox News - using their YouTube channel for live streams when available
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCXIJgqnII2ZOINSWNOGFThA&autoplay=1&mute=1",
    description: "US News",
    type: "youtube",
  },
  {
    id: "cnn",
    name: "CNN",
    // CNN - using their YouTube channel for live streams when available
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCupvZG-5ko_eiXAupbDfxWw&autoplay=1&mute=1",
    description: "US News",
    type: "youtube",
  },
  {
    id: "abc",
    name: "ABC News",
    // ABC News Live - reliable 24/7 stream
    embedUrl: "https://www.youtube.com/embed/gN0PZCe-kwQ?autoplay=1&mute=1",
    description: "24/7 Live",
    type: "youtube",
  },
];

export default function VideoPlayer() {
  const [focusedChannel, setFocusedChannel] = useState<string | null>(null);
  const [failedChannels, setFailedChannels] = useState<Set<string>>(new Set());

  const handleChannelError = (channelId: string) => {
    setFailedChannels(prev => new Set(prev).add(channelId));
  };

  // Single channel focused view
  if (focusedChannel) {
    const channel = CHANNELS.find(c => c.id === focusedChannel)!;
    return (
      <div className="h-full flex flex-col">
        <div className="section-header">
          <div className="flex items-center gap-3">
            <span className="live-indicator">En Vivo</span>
            <span className="text-[var(--text-primary)] font-medium normal-case tracking-normal">
              {channel.name}
            </span>
          </div>
          <button
            onClick={() => setFocusedChannel(null)}
            className="text-xs text-[var(--accent-blue)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Ver todos
          </button>
        </div>
        <div className="flex-1 bg-black relative">
          <iframe
            src={channel.embedUrl}
            title={channel.name}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // Multi-view grid
  return (
    <div className="h-full flex flex-col">
      <div className="section-header">
        <div className="flex items-center gap-3">
          <span className="live-indicator">En Vivo</span>
          <span className="text-[var(--text-primary)] font-medium normal-case tracking-normal">
            Multi-Vista
          </span>
        </div>
        <span className="time-badge">{CHANNELS.length} canales</span>
      </div>

      {/* 3x2 Grid */}
      <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-px bg-[var(--border-subtle)] min-h-0">
        {CHANNELS.map((channel) => (
          <div
            key={channel.id}
            className="relative bg-black group cursor-pointer"
            onClick={() => setFocusedChannel(channel.id)}
          >
            {/* Video iframe */}
            {!failedChannels.has(channel.id) ? (
              <iframe
                src={channel.embedUrl}
                title={channel.name}
                className="absolute inset-0 w-full h-full pointer-events-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                onError={() => handleChannelError(channel.id)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-tertiary)]">
                <div className="text-center p-4">
                  <div className="text-[var(--text-muted)] text-sm mb-2">
                    Señal no disponible
                  </div>
                  <div className="text-[var(--text-muted)] text-xs">
                    {channel.name}
                  </div>
                </div>
              </div>
            )}

            {/* Channel label overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 pointer-events-none">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">{channel.name}</span>
                  <span className="text-[10px] text-white/60">{channel.description}</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-[var(--accent-red)] animate-pulse" />
              </div>
            </div>

            {/* Hover overlay for click hint */}
            <div className="absolute inset-0 bg-[var(--accent-blue)]/0 group-hover:bg-[var(--accent-blue)]/10 transition-colors pointer-events-none flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-white bg-black/70 px-2 py-1 rounded">
                Ampliar
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="px-3 py-2 bg-[var(--bg-tertiary)] border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)]">
        ABC News 24/7. Otros canales disponibles solo cuando transmiten en vivo.
      </div>
    </div>
  );
}
