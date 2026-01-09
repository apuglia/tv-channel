"use client";

import { useState, useEffect } from "react";
import { useExpand } from "./ExpandContext";

interface Tweet {
  id: string;
  text: string;
  author: {
    name: string;
    username: string;
    profile_image_url?: string;
  };
  created_at: string;
  metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
  };
  isHighEngagement?: boolean;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export default function TwitterFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { expandItem } = useExpand();

  const fetchTweets = async () => {
    try {
      const response = await fetch("/api/twitter");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setTweets(data.tweets || []);
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
    fetchTweets();
    const interval = setInterval(fetchTweets, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTweetClick = (tweet: Tweet) => {
    expandItem({
      type: "tweet",
      id: tweet.id,
      text: tweet.text,
      source: `@${tweet.author.username}`,
      timestamp: tweet.created_at,
      author: tweet.author,
      metrics: tweet.metrics,
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="section-header">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>X / Twitter</span>
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
          <div className="p-4 text-center text-[var(--text-muted)]">
            {error}
          </div>
        ) : tweets.length === 0 ? (
          <div className="p-4 text-center text-[var(--text-muted)]">
            Sin tweets disponibles
          </div>
        ) : (
          tweets.map((tweet) => (
            <div
              key={tweet.id}
              onClick={() => handleTweetClick(tweet)}
              className={`tweet-card cursor-pointer ${tweet.isHighEngagement ? "high-engagement" : ""}`}
            >
              {/* Author line */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-xs font-medium text-[var(--text-secondary)]">
                  {tweet.author.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-[var(--text-primary)] truncate">
                      {tweet.author.name}
                    </span>
                    {tweet.isHighEngagement && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--accent-yellow)]">
                        Viral
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    @{tweet.author.username}
                  </span>
                </div>
                <span className="time-badge">{timeAgo(tweet.created_at)}</span>
              </div>

              {/* Tweet text */}
              <p className="text-body mb-3 leading-relaxed line-clamp-3">
                {tweet.text}
              </p>

              {/* Metrics */}
              {tweet.metrics && (
                <div className="metrics">
                  <span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {formatNumber(tweet.metrics.reply_count)}
                  </span>
                  <span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {formatNumber(tweet.metrics.retweet_count)}
                  </span>
                  <span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {formatNumber(tweet.metrics.like_count)}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
