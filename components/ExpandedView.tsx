"use client";

import { useEffect } from "react";

interface ExpandedItem {
  type: "tweet" | "news" | "telegram";
  id: string;
  title?: string;
  text: string;
  source: string;
  sourceUrl?: string;
  timestamp: string;
  author?: {
    name: string;
    username: string;
  };
  metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
  };
}

interface ExpandedViewProps {
  item: ExpandedItem;
  onClose: () => void;
}

// Simple QR code generator using a public API
function QRCode({ url, size = 150 }: { url: string; size?: number }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=161b22&color=e6edf3`;

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={qrUrl}
        alt="QR Code"
        width={size}
        height={size}
        className="rounded-lg"
      />
      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">
        Escanear para abrir
      </span>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString("es-VE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ExpandedView({ item, onClose }: ExpandedViewProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const getTypeLabel = () => {
    switch (item.type) {
      case "tweet": return "Tweet";
      case "news": return "Noticia";
      case "telegram": return "Telegram";
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case "tweet": return "var(--accent-blue)";
      case "news": return "var(--accent-orange)";
      case "telegram": return "var(--accent-blue)";
    }
  };

  // Generate a URL for the item
  const getItemUrl = (): string => {
    if (item.sourceUrl) return item.sourceUrl;
    if (item.type === "tweet" && item.author) {
      return `https://twitter.com/${item.author.username}/status/${item.id}`;
    }
    return "";
  };

  const itemUrl = getItemUrl();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[80vh] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <span
              className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded"
              style={{ backgroundColor: getTypeColor(), color: "#fff" }}
            >
              {getTypeLabel()}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">
              {item.source}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex gap-8">
            {/* Main content */}
            <div className="flex-1">
              {/* Author (for tweets) */}
              {item.author && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-lg font-semibold text-[var(--text-secondary)]">
                    {item.author.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">{item.author.name}</div>
                    <div className="text-sm text-[var(--text-muted)]">@{item.author.username}</div>
                  </div>
                </div>
              )}

              {/* Title (for news) */}
              {item.title && (
                <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4 leading-tight">
                  {item.title}
                </h2>
              )}

              {/* Text content */}
              <p className="text-lg text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {item.text}
              </p>

              {/* Metrics (for tweets) */}
              {item.metrics && (
                <div className="flex gap-6 mt-6 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm">{formatNumber(item.metrics.reply_count)} respuestas</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm">{formatNumber(item.metrics.retweet_count)} retweets</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm">{formatNumber(item.metrics.like_count)} likes</span>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="mt-4 text-sm text-[var(--text-muted)]">
                {formatDate(item.timestamp)}
              </div>
            </div>

            {/* QR Code sidebar */}
            {itemUrl && (
              <div className="flex-shrink-0 flex flex-col items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-lg">
                <QRCode url={itemUrl} size={150} />
                <div className="text-center">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">Abrir en móvil</div>
                  <div className="text-[10px] text-[var(--text-muted)] max-w-[150px] truncate">
                    {itemUrl}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
          <span className="text-xs text-[var(--text-muted)]">
            Presiona ESC o haz clic afuera para cerrar
          </span>
          {itemUrl && (
            <a
              href={itemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--accent-blue)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
            >
              Abrir fuente
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
