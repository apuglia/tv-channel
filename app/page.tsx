"use client";

import { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import TwitterFeed from "@/components/TwitterFeed";
import NewsFeed from "@/components/NewsFeed";
import TelegramFeed from "@/components/TelegramFeed";
import AlertBanner from "@/components/AlertBanner";
import { ExpandProvider } from "@/components/ExpandContext";

type MobileTab = "tv" | "twitter" | "news" | "telegram";

export default function Dashboard() {
  const [mobileTab, setMobileTab] = useState<MobileTab>("tv");
  const [showCastModal, setShowCastModal] = useState(false);

  const handleCast = async () => {
    // Check if browser supports native casting (Chrome)
    if ('chrome' in window && (window as Window & { chrome?: { cast?: unknown } }).chrome?.cast) {
      // Chrome cast available - will show native dialog
      setShowCastModal(true);
    } else {
      setShowCastModal(true);
    }
  };

  return (
    <ExpandProvider>
      <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
        {/* Alert Banner */}
        <AlertBanner />

        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-1 gap-1 p-1 min-h-0">
          {/* Video Player - left side */}
          <div className="w-[58%] card overflow-hidden">
            <VideoPlayer />
          </div>

          {/* Right Panel */}
          <div className="flex-1 flex flex-col gap-1 min-h-0">
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

        {/* Mobile Layout */}
        <div className="flex-1 flex flex-col lg:hidden min-h-0">
          {/* Mobile Tab Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {mobileTab === "tv" && (
              <div className="h-full">
                <VideoPlayer />
              </div>
            )}
            {mobileTab === "twitter" && (
              <div className="h-full card m-1">
                <TwitterFeed />
              </div>
            )}
            {mobileTab === "news" && (
              <div className="h-full card m-1">
                <NewsFeed />
              </div>
            )}
            {mobileTab === "telegram" && (
              <div className="h-full card m-1">
                <TelegramFeed />
              </div>
            )}
          </div>

          {/* Mobile Tab Bar */}
          <div className="flex border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <button
              onClick={() => setMobileTab("tv")}
              className={`flex-1 py-3 text-xs font-medium transition-colors flex flex-col items-center gap-1 ${
                mobileTab === "tv"
                  ? "text-[var(--accent-blue)] bg-[var(--bg-tertiary)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              TV
            </button>
            <button
              onClick={() => setMobileTab("twitter")}
              className={`flex-1 py-3 text-xs font-medium transition-colors flex flex-col items-center gap-1 ${
                mobileTab === "twitter"
                  ? "text-[var(--accent-blue)] bg-[var(--bg-tertiary)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Twitter
            </button>
            <button
              onClick={() => setMobileTab("news")}
              className={`flex-1 py-3 text-xs font-medium transition-colors flex flex-col items-center gap-1 ${
                mobileTab === "news"
                  ? "text-[var(--accent-blue)] bg-[var(--bg-tertiary)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Noticias
            </button>
            <button
              onClick={() => setMobileTab("telegram")}
              className={`flex-1 py-3 text-xs font-medium transition-colors flex flex-col items-center gap-1 ${
                mobileTab === "telegram"
                  ? "text-[var(--accent-blue)] bg-[var(--bg-tertiary)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </button>
            {/* Cast Button */}
            <button
              onClick={handleCast}
              className="px-4 py-3 text-xs font-medium transition-colors flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-[var(--accent-blue)] border-l border-[var(--border-subtle)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17a4 4 0 014 4M3 12a9 9 0 019 9M3 7c7.732 0 14 6.268 14 14" />
              </svg>
              Cast
            </button>
          </div>
        </div>

        {/* Status Bar - Desktop only */}
        <div className="status-bar hidden lg:flex">
          <div className="flex items-center gap-4">
            <span className="live-indicator">Monitoreo Activo</span>
            <span>Venezuela Monitor v1.0</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Click en cualquier item para expandir</span>
            <CurrentTime />
          </div>
        </div>

        {/* Cast Modal */}
        {showCastModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCastModal(false)}
          >
            <div
              className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-[var(--accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17a4 4 0 014 4M3 12a9 9 0 019 9M3 7c7.732 0 14 6.268 14 14" />
                </svg>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Transmitir a TV</h3>
              </div>

              <div className="space-y-4 text-sm text-[var(--text-secondary)]">
                <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <div className="font-medium text-[var(--text-primary)] mb-1">Chrome / Edge</div>
                  <p>Menú (⋮) → Transmitir → Selecciona tu TV</p>
                </div>

                <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <div className="font-medium text-[var(--text-primary)] mb-1">iPhone / iPad</div>
                  <p>Centro de Control → Screen Mirroring → Apple TV</p>
                </div>

                <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <div className="font-medium text-[var(--text-primary)] mb-1">Android</div>
                  <p>Ajustes rápidos → Smart View / Cast → Tu TV</p>
                </div>

                <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <div className="font-medium text-[var(--text-primary)] mb-1">Fire TV</div>
                  <p>Abre el navegador Silk y visita esta URL directamente</p>
                </div>
              </div>

              <button
                onClick={() => setShowCastModal(false)}
                className="mt-4 w-full py-2 bg-[var(--accent-blue)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
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
