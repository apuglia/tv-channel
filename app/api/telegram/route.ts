import { NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Default channels to monitor - can be overridden with TELEGRAM_CHANNELS env var
const DEFAULT_CHANNELS = ["DrodriguezVen"];
const TELEGRAM_CHANNELS = process.env.TELEGRAM_CHANNELS?.split(",") || DEFAULT_CHANNELS;

interface TelegramMessage {
  id: string;
  text: string;
  channel: string;
  date: string;
  hasMedia: boolean;
}

async function fetchChannelMessages(channelId: string): Promise<TelegramMessage[]> {
  if (!TELEGRAM_BOT_TOKEN) {
    return [];
  }

  try {
    // Note: To read channel messages, the bot must be an admin of the channel
    // This is a simplified implementation - in production you'd use MTProto or
    // set up a webhook to receive messages

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=-10&limit=20`,
      { next: { revalidate: 30 } }
    );

    if (!response.ok) {
      console.error(`Telegram API error: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.ok || !data.result) {
      return [];
    }

    // Filter messages from configured channels
    return data.result
      .filter((update: { channel_post?: { chat?: { username?: string } } }) => {
        const chatUsername = update.channel_post?.chat?.username;
        return chatUsername && TELEGRAM_CHANNELS.includes(chatUsername);
      })
      .map((update: {
        channel_post: {
          message_id: number;
          text?: string;
          caption?: string;
          chat: { title: string };
          date: number;
          photo?: unknown;
          video?: unknown;
          document?: unknown;
        }
      }) => ({
        id: `${update.channel_post.message_id}`,
        text: update.channel_post.text || update.channel_post.caption || "[Media]",
        channel: update.channel_post.chat.title,
        date: new Date(update.channel_post.date * 1000).toISOString(),
        hasMedia: !!(
          update.channel_post.photo ||
          update.channel_post.video ||
          update.channel_post.document
        ),
      }));
  } catch (error) {
    console.error("Telegram fetch error:", error);
    return [];
  }
}

export async function GET() {
  // If no token configured, return helpful mock data
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_CHANNELS.length === 0) {
    const mockMessages: TelegramMessage[] = [
      {
        id: "mock-1",
        text: "Telegram no configurado. Para habilitar:\n\n1. Crea un bot con @BotFather\n2. Añade el bot como admin a tus canales\n3. Configura TELEGRAM_BOT_TOKEN y TELEGRAM_CHANNELS en .env.local",
        channel: "Configuración",
        date: new Date().toISOString(),
        hasMedia: false,
      },
    ];

    return NextResponse.json({ messages: mockMessages });
  }

  try {
    const messages = await fetchChannelMessages("");

    // Sort by date (most recent first)
    messages.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({ messages: messages.slice(0, 20) });
  } catch (error) {
    console.error("Telegram API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Telegram messages", messages: [] },
      { status: 500 }
    );
  }
}
