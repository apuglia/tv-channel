"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import ExpandedView from "./ExpandedView";

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

interface ExpandContextType {
  expandItem: (item: ExpandedItem) => void;
}

const ExpandContext = createContext<ExpandContextType | null>(null);

export function useExpand() {
  const context = useContext(ExpandContext);
  if (!context) {
    throw new Error("useExpand must be used within an ExpandProvider");
  }
  return context;
}

export function ExpandProvider({ children }: { children: ReactNode }) {
  const [expandedItem, setExpandedItem] = useState<ExpandedItem | null>(null);

  const expandItem = (item: ExpandedItem) => {
    setExpandedItem(item);
  };

  const closeExpanded = () => {
    setExpandedItem(null);
  };

  return (
    <ExpandContext.Provider value={{ expandItem }}>
      {children}
      {expandedItem && (
        <ExpandedView item={expandedItem} onClose={closeExpanded} />
      )}
    </ExpandContext.Provider>
  );
}
