"use client";

import { useState } from "react";

interface Channel {
  id: string;
  name: string;
  youtubeId: string;
  description: string;
}

const CHANNELS: Channel[] = [
  {
    id: "globovision",
    name: "Globovisión",
    youtubeId: "UCfJtBtmhnIyfUB6RqXeImMw",
    description: "Noticias 24/7",
  },
  {
    id: "ntn24",
    name: "NTN24",
    youtubeId: "UCnSFCUQBKKkcz5KiP_-z9FQ",
    description: "Internacional",
  },
  {
    id: "vtv",
    name: "VTV",
    youtubeId: "UCXpZgmJQJOh8psrRoD3tlMg",
    description: "Estatal",
  },
  {
    id: "vpi",
    name: "VPItv",
    youtubeId: "UCVFiIRuxJ2GmJLUkHmlmj4w",
    description: "Press Intl.",
  },
];

export default function VideoPlayer() {
  const [focusedChannel, setFocusedChannel] = useState<string | null>(null);

  const getEmbedUrl = (channel: Channel) => {
    return `https://www.youtube.com/embed/live_stream?channel=${channel.youtubeId}&autoplay=1&mute=1`;
  };

  // If a channel is focused, show it large
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
        <div className="flex-1 bg-black">
          <div className="video-container">
            <iframe
              src={getEmbedUrl(channel)}
              title={channel.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
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

      {/* 2x2 Grid */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px bg-[var(--border-subtle)] min-h-0">
        {CHANNELS.map((channel) => (
          <div
            key={channel.id}
            className="relative bg-black group cursor-pointer"
            onClick={() => setFocusedChannel(channel.id)}
          >
            {/* Video */}
            <iframe
              src={getEmbedUrl(channel)}
              title={channel.name}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />

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

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-[var(--accent-blue)]/0 group-hover:bg-[var(--accent-blue)]/10 transition-colors pointer-events-none flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-white bg-black/70 px-2 py-1 rounded">
                Ampliar
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
