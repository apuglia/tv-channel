"use client";

import { useState, useEffect } from "react";

interface Alert {
  id: string;
  text: string;
  type: "breaking" | "trending" | "urgent";
  source: string;
  timestamp: string;
}

export default function AlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchAlerts = async () => {
    try {
      const twitterRes = await fetch("/api/twitter?alerts=true");
      const twitterData = await twitterRes.json();

      const newsRes = await fetch("/api/news?breaking=true");
      const newsData = await newsRes.json();

      const newAlerts: Alert[] = [];

      if (twitterData.alerts) {
        twitterData.alerts.forEach((tweet: { id: string; text: string; author: { username: string }; created_at: string }) => {
          newAlerts.push({
            id: `twitter-${tweet.id}`,
            text: tweet.text,
            type: "trending",
            source: `@${tweet.author.username}`,
            timestamp: tweet.created_at,
          });
        });
      }

      if (newsData.breaking) {
        newsData.breaking.forEach((news: { id: string; title: string; source: string; pubDate: string }) => {
          newAlerts.push({
            id: `news-${news.id}`,
            text: news.title,
            type: "breaking",
            source: news.source,
            timestamp: news.pubDate,
          });
        });
      }

      setAlerts(newAlerts);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (alerts.length === 0) {
      setIsVisible(false);
      return;
    }

    let index = 0;
    setCurrentAlert(alerts[0]);
    setIsVisible(true);

    const rotateInterval = setInterval(() => {
      index = (index + 1) % alerts.length;
      setCurrentAlert(alerts[index]);
    }, 10000);

    return () => clearInterval(rotateInterval);
  }, [alerts]);

  if (!isVisible || !currentAlert) {
    return null;
  }

  return (
    <div className={`alert-banner ${currentAlert.type} animate-slide-in text-xs lg:text-sm`}>
      {/* Label */}
      <span className={`alert-label ${currentAlert.type} text-[8px] lg:text-[10px]`}>
        {currentAlert.type === "breaking" ? "Última Hora" : "Tendencia"}
      </span>

      {/* Divider - hidden on mobile */}
      <div className="hidden lg:block w-px h-4 bg-[var(--border-primary)]" />

      {/* Content */}
      <p className="flex-1 truncate text-[11px] lg:text-[13px]">{currentAlert.text}</p>

      {/* Source - hidden on very small screens */}
      <span className="hidden sm:inline text-[10px] lg:text-xs text-[var(--text-muted)] whitespace-nowrap">
        {currentAlert.source}
      </span>
    </div>
  );
}
