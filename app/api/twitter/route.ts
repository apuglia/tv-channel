import { NextRequest, NextResponse } from "next/server";

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// Key Venezuelan political accounts to monitor
const ACCOUNTS_TO_MONITOR = [
  "NicolasMaduro",
  "jaborealismo",
  "MariaCorinaMachado",
  "EdmundGonzalez",
  "GobsucreVE",
  "ABOREAL",
  "AlertaVzla",
  "LuisaOrtegaDiaz",
];

// Hashtags to track
const HASHTAGS = ["Venezuela", "Maduro", "Oposición"];

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

async function fetchTwitterAPI(endpoint: string) {
  if (!TWITTER_BEARER_TOKEN) {
    throw new Error("Twitter API token not configured");
  }

  const response = await fetch(`https://api.twitter.com/2${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
    },
    next: { revalidate: 30 }, // Cache for 30 seconds
  });

  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.status}`);
  }

  return response.json();
}

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

interface RawTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
  };
}

async function searchTweets(query: string, maxResults: number = 20): Promise<Tweet[]> {
  const endpoint = `/tweets/search/recent?query=${encodeURIComponent(
    query
  )}&max_results=${maxResults}&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=name,username,profile_image_url`;

  const data = await fetchTwitterAPI(endpoint);

  if (!data.data) return [];

  const users = new Map<string, TwitterUser>(
    (data.includes?.users || []).map((user: TwitterUser) => [user.id, user])
  );

  return data.data.map((tweet: RawTweet) => {
    const author: TwitterUser = users.get(tweet.author_id) || { id: "", name: "Unknown", username: "unknown" };
    const isHighEngagement =
      tweet.public_metrics &&
      (tweet.public_metrics.retweet_count > 100 ||
        tweet.public_metrics.like_count > 500);

    return {
      id: tweet.id,
      text: tweet.text,
      author: {
        name: author.name,
        username: author.username,
        profile_image_url: author.profile_image_url,
      },
      created_at: tweet.created_at,
      metrics: tweet.public_metrics
        ? {
            retweet_count: tweet.public_metrics.retweet_count,
            like_count: tweet.public_metrics.like_count,
            reply_count: tweet.public_metrics.reply_count,
          }
        : undefined,
      isHighEngagement,
    };
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const alertsOnly = searchParams.get("alerts") === "true";

  // If no token, return mock data for demo purposes
  if (!TWITTER_BEARER_TOKEN) {
    const mockTweets: Tweet[] = [
      {
        id: "1",
        text: "ÚLTIMA HORA: Importantes acontecimientos políticos en Venezuela. La situación continúa desarrollándose en Caracas. #Venezuela",
        author: { name: "Noticias Venezuela", username: "NoticiasVE" },
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        metrics: { retweet_count: 245, like_count: 890, reply_count: 123 },
        isHighEngagement: true,
      },
      {
        id: "2",
        text: "La comunidad internacional se pronuncia sobre los eventos recientes. Seguimos monitoreando la situación. #Venezuela #Política",
        author: { name: "Analista Político", username: "AnalistaPol" },
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        metrics: { retweet_count: 89, like_count: 234, reply_count: 45 },
        isHighEngagement: false,
      },
      {
        id: "3",
        text: "Reportan concentraciones en varias ciudades del país. La población se mantiene atenta a los acontecimientos.",
        author: { name: "Periodista VE", username: "PeriodistaVE" },
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        metrics: { retweet_count: 567, like_count: 1234, reply_count: 234 },
        isHighEngagement: true,
      },
      {
        id: "4",
        text: "Comunicado oficial: Se esperan declaraciones importantes en las próximas horas.",
        author: { name: "Info Venezuela", username: "InfoVzla" },
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        metrics: { retweet_count: 123, like_count: 456, reply_count: 78 },
        isHighEngagement: false,
      },
    ];

    if (alertsOnly) {
      return NextResponse.json({
        alerts: mockTweets.filter((t) => t.isHighEngagement),
      });
    }

    return NextResponse.json({ tweets: mockTweets });
  }

  try {
    // Build search query: accounts OR hashtags, in Spanish, excluding retweets
    const accountQuery = ACCOUNTS_TO_MONITOR.map(
      (acc) => `from:${acc}`
    ).join(" OR ");
    const hashtagQuery = HASHTAGS.map((tag) => `#${tag}`).join(" OR ");
    const query = `(${accountQuery} OR ${hashtagQuery}) lang:es -is:retweet`;

    const tweets = await searchTweets(query, 30);

    // Sort by engagement and recency
    tweets.sort((a, b) => {
      // High engagement first
      if (a.isHighEngagement && !b.isHighEngagement) return -1;
      if (!a.isHighEngagement && b.isHighEngagement) return 1;
      // Then by date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (alertsOnly) {
      return NextResponse.json({
        alerts: tweets.filter((t) => t.isHighEngagement).slice(0, 5),
      });
    }

    return NextResponse.json({ tweets: tweets.slice(0, 20) });
  } catch (error) {
    console.error("Twitter API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tweets", tweets: [] },
      { status: 500 }
    );
  }
}
