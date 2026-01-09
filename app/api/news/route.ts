import { NextRequest, NextResponse } from "next/server";

// RSS feeds from Venezuelan news sources
const RSS_FEEDS = [
  {
    name: "El Nacional",
    url: "https://www.elnacional.com/feed/",
  },
  {
    name: "Efecto Cocuyo",
    url: "https://efectococuyo.com/feed/",
  },
  {
    name: "Runrun.es",
    url: "https://runrun.es/feed/",
  },
  {
    name: "Monitoreamos",
    url: "https://monitoreamos.com/feed/",
  },
  {
    name: "La Patilla",
    url: "https://www.lapatilla.com/feed/",
  },
];

// Keywords that indicate breaking news
const BREAKING_KEYWORDS = [
  "última hora",
  "urgente",
  "alerta",
  "breaking",
  "ahora",
  "en vivo",
  "desarrollando",
  "atención",
  "importante",
];

interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string;
  isBreaking: boolean;
}

async function parseRSSFeed(feedUrl: string, sourceName: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${sourceName}: ${response.status}`);
      return [];
    }

    const text = await response.text();
    const items: NewsItem[] = [];

    // Simple XML parsing for RSS items
    const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];

    for (const itemXml of itemMatches.slice(0, 10)) {
      const title = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/i);
      const link = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
      const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);

      if (title && link) {
        const titleText = (title[1] || title[2] || "").trim();
        const linkText = link[1].trim();
        const pubDateText = pubDate ? pubDate[1].trim() : new Date().toISOString();

        // Check if it's breaking news
        const isBreaking = BREAKING_KEYWORDS.some((keyword) =>
          titleText.toLowerCase().includes(keyword)
        );

        // Create unique ID using source, index, and a hash of the link
        const hash = Buffer.from(linkText).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(-12);
        items.push({
          id: `${sourceName}-${items.length}-${hash}`,
          title: titleText,
          link: linkText,
          source: sourceName,
          pubDate: pubDateText,
          isBreaking,
        });
      }
    }

    return items;
  } catch (error) {
    console.error(`Error parsing ${sourceName}:`, error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const breakingOnly = searchParams.get("breaking") === "true";

  try {
    // Fetch all RSS feeds in parallel
    const feedPromises = RSS_FEEDS.map((feed) =>
      parseRSSFeed(feed.url, feed.name)
    );

    const results = await Promise.all(feedPromises);
    let allNews = results.flat();

    // Sort by date (most recent first)
    allNews.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    // Remove duplicates based on similar titles
    const seenTitles = new Set<string>();
    allNews = allNews.filter((item) => {
      const normalizedTitle = item.title.toLowerCase().slice(0, 50);
      if (seenTitles.has(normalizedTitle)) return false;
      seenTitles.add(normalizedTitle);
      return true;
    });

    if (breakingOnly) {
      return NextResponse.json({
        breaking: allNews.filter((item) => item.isBreaking).slice(0, 5),
      });
    }

    return NextResponse.json({
      news: allNews.slice(0, 30),
    });
  } catch (error) {
    console.error("News fetch error:", error);

    // Return mock data on error
    const mockNews: NewsItem[] = [
      {
        id: "mock-1",
        title: "Últimas noticias de Venezuela - Actualizaciones políticas",
        link: "#",
        source: "Demo",
        pubDate: new Date().toISOString(),
        isBreaking: true,
      },
      {
        id: "mock-2",
        title: "Análisis: La situación económica y sus perspectivas",
        link: "#",
        source: "Demo",
        pubDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isBreaking: false,
      },
      {
        id: "mock-3",
        title: "Comunidad internacional observa desarrollos en el país",
        link: "#",
        source: "Demo",
        pubDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        isBreaking: false,
      },
    ];

    return NextResponse.json({ news: mockNews });
  }
}
