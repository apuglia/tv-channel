"use client";

import { useState, useEffect } from "react";
import { useExpand } from "./ExpandContext";

interface TelegramMessage {
  id: string;
  text: string;
  channel: string;
  date: string;
  hasMedia?: boolean;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "ahora";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export default function TelegramFeed() {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { expandItem } = useExpand();

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/telegram");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setMessages(data.messages || []);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError("Connection error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMessageClick = (msg: TelegramMessage) => {
    expandItem({
      type: "telegram",
      id: msg.id,
      text: msg.text,
      source: msg.channel,
      timestamp: msg.date,
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="section-header">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          <span>Telegram</span>
        </div>
        <span className="time-badge">{lastUpdate.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>

      {/* Content */}
      <div className="flex-1 feed-scroll min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Cargando...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-[var(--text-muted)]">{error}</div>
        ) : messages.length === 0 ? (
          <div className="p-4 text-[var(--text-muted)] text-sm">
            <p className="font-medium mb-2">Telegram no configurado</p>
            <p className="text-xs leading-relaxed">
              Configura TELEGRAM_BOT_TOKEN en .env.local
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => handleMessageClick(msg)}
              className="feed-item cursor-pointer"
            >
              {/* Meta line */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[var(--accent-blue)]">
                  {msg.channel}
                </span>
                <span className="time-badge">{timeAgo(msg.date)}</span>
              </div>

              {/* Message */}
              <p className="text-body leading-relaxed line-clamp-2">{msg.text}</p>

              {/* Media indicator */}
              {msg.hasMedia && (
                <div className="mt-2 text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Multimedia
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
