"use client";

import VideoPlayer from "@/components/VideoPlayer";
import TwitterFeed from "@/components/TwitterFeed";
import NewsFeed from "@/components/NewsFeed";
import TelegramFeed from "@/components/TelegramFeed";
import AlertBanner from "@/components/AlertBanner";
import { ExpandProvider } from "@/components/ExpandContext";

export default function Dashboard() {
  return (
    <ExpandProvider>
      <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
        {/* Alert Banner */}
        <AlertBanner />

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-12 gap-1 p-1 min-h-0">
          {/* Video Player - 7 columns */}
          <div className="col-span-7 card overflow-hidden">
            <VideoPlayer />
          </div>

          {/* Right Panel - 5 columns */}
          <div className="col-span-5 flex flex-col gap-1 min-h-0">
            {/* Twitter Feed */}
            <div className="flex-1 card overflow-hidden min-h-0">
              <TwitterFeed />
            </div>

            {/* News + Telegram */}
            <div className="flex-1 grid grid-cols-2 gap-1 min-h-0">
              <div className="card overflow-hidden">
                <NewsFeed />
              </div>
              <div className="card overflow-hidden">
                <TelegramFeed />
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="status-bar">
          <div className="flex items-center gap-4">
            <span className="live-indicator">Monitoreo Activo</span>
            <span>Venezuela Monitor v1.0</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Click en cualquier item para expandir</span>
            <CurrentTime />
          </div>
        </div>
      </div>
    </ExpandProvider>
  );
}

function CurrentTime() {
  return (
    <span suppressHydrationWarning>
      {new Date().toLocaleDateString("es-VE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      })}
    </span>
  );
}
