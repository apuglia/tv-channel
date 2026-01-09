"use client";

import { useState, useEffect } from "react";
import { useExpand } from "./ExpandContext";

interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string;
  isBreaking?: boolean;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "ahora";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { expandItem } = useExpand();

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/news");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setNews(data.news || []);
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
    fetchNews();
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNewsClick = (item: NewsItem) => {
    expandItem({
      type: "news",
      id: item.id,
      title: item.title,
      text: item.title, // For news, title is the main content in RSS
      source: item.source,
      sourceUrl: item.link,
      timestamp: item.pubDate,
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="section-header">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <span>Noticias</span>
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
        ) : news.length === 0 ? (
          <div className="p-4 text-center text-[var(--text-muted)]">
            Sin noticias disponibles
          </div>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNewsClick(item)}
              className={`feed-item cursor-pointer ${item.isBreaking ? "breaking-highlight" : ""}`}
            >
              {/* Meta line */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="source-badge">{item.source}</span>
                {item.isBreaking && (
                  <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[var(--accent-red)] text-white">
                    Urgente
                  </span>
                )}
                <span className="time-badge ml-auto">{timeAgo(item.pubDate)}</span>
              </div>

              {/* Headline */}
              <h3 className="text-headline line-clamp-2">{item.title}</h3>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
