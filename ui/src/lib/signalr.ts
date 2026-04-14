import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { API_BASE_URL } from "@/lib/api";

const TOKEN_KEY = "token";

// Single shared chat-hub connection per page — reused across components that
// subscribe to different conversation groups. The JWT is read fresh on each
// reconnect so rotated tokens are honored.
let chatConnection: HubConnection | null = null;

export function getChatConnection(): HubConnection {
  if (chatConnection) return chatConnection;

  chatConnection = new HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/chat`, {
      accessTokenFactory: () => {
        if (typeof window === "undefined") return "";
        return localStorage.getItem(TOKEN_KEY) ?? "";
      },
    })
    .withAutomaticReconnect([0, 1000, 3000, 8000])
    .configureLogging(LogLevel.Warning)
    .build();

  return chatConnection;
}

export async function ensureChatConnected(): Promise<HubConnection> {
  const conn = getChatConnection();
  if (conn.state === HubConnectionState.Disconnected) {
    await conn.start();
  }
  return conn;
}

export async function joinConversation(conversationUid: string): Promise<void> {
  const conn = await ensureChatConnected();
  await conn.invoke("JoinConversation", conversationUid);
}

export async function leaveConversation(conversationUid: string): Promise<void> {
  if (!chatConnection || chatConnection.state !== HubConnectionState.Connected) return;
  await chatConnection.invoke("LeaveConversation", conversationUid);
}

export async function sendTyping(conversationUid: string): Promise<void> {
  if (!chatConnection || chatConnection.state !== HubConnectionState.Connected) return;
  await chatConnection.invoke("Typing", conversationUid);
}
