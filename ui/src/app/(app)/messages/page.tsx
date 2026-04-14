"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Send, BadgeCheck } from "lucide-react";
import { conversationsApi } from "@/lib/api";
import { ensureChatConnected, joinConversation, leaveConversation } from "@/lib/signalr";
import { useAuth } from "@/lib/auth";
import type { ConversationDto, MessageDto } from "@/lib/types";

export default function MessagesPage() {
  const { business } = useAuth();
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial conversations fetch
  useEffect(() => {
    conversationsApi
      .list()
      .then((p) => {
        setConversations(p.items);
        if (p.items.length > 0 && !activeUid) setActiveUid(p.items[0].uid);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load messages + SignalR wiring whenever active conversation changes
  useEffect(() => {
    if (!activeUid) return;
    let cancelled = false;

    conversationsApi.messages(activeUid).then((p) => {
      if (cancelled) return;
      // API returns newest-first; reverse for display
      setMessages([...p.items].reverse());
    });

    let connectedUid = activeUid;
    let unsubReceived: (() => void) | null = null;
    let unsubRead: (() => void) | null = null;

    (async () => {
      try {
        const conn = await ensureChatConnected();
        await joinConversation(activeUid);

        const onReceived = (msg: MessageDto) => {
          if (msg.conversationUid !== activeUid) return;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
          );
        };
        const onRead = (payload: { conversationUid: string; upToMessageId: number }) => {
          if (payload.conversationUid !== activeUid) return;
          setMessages((prev) =>
            prev.map((m) =>
              m.id <= payload.upToMessageId && !m.readAt
                ? { ...m, readAt: new Date().toISOString() }
                : m
            )
          );
        };

        conn.on("messageReceived", onReceived);
        conn.on("messageRead", onRead);
        unsubReceived = () => conn.off("messageReceived", onReceived);
        unsubRead = () => conn.off("messageRead", onRead);
      } catch {
        // SignalR unavailable — page still works with manual refresh
      }
    })();

    return () => {
      cancelled = true;
      unsubReceived?.();
      unsubRead?.();
      leaveConversation(connectedUid).catch(() => {});
    };
  }, [activeUid]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // Mark read when viewing
  useEffect(() => {
    if (!activeUid || messages.length === 0) return;
    const lastFromOther = [...messages].reverse().find((m) => m.senderBusinessUid !== business?.uid);
    if (!lastFromOther || lastFromOther.readAt) return;
    conversationsApi.read(activeUid, lastFromOther.id).catch(() => {});
  }, [activeUid, messages, business?.uid]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      c.participants.some((p) => p.businessName.toLowerCase().includes(q))
      || (c.lastMessage?.content.toLowerCase().includes(q) ?? false)
    );
  }, [conversations, search]);

  const active = conversations.find((c) => c.uid === activeUid);
  const other = active?.participants.find((p) => p.businessUid !== business?.uid);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!activeUid || !draft.trim() || sending) return;
    setSending(true);
    try {
      const msg = await conversationsApi.send(activeUid, draft);
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-border overflow-hidden">
      {/* Conversation list */}
      <div className="w-72 border-r border-border bg-background flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-foreground-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full h-8 rounded-md border border-input bg-transparent pl-8 pr-2 text-sm outline-none placeholder:text-foreground-tertiary focus-visible:border-ring"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-xs text-foreground-tertiary">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-foreground-tertiary">No conversations</p>
            </div>
          ) : (
            <ul>
              {filtered.map((c) => {
                const counterpart = c.participants.find((p) => p.businessUid !== business?.uid);
                const isActive = c.uid === activeUid;
                return (
                  <li key={c.uid}>
                    <button
                      onClick={() => setActiveUid(c.uid)}
                      className={`w-full text-left px-3 py-2 border-b border-border hover:bg-background-secondary ${
                        isActive ? "bg-background-secondary" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate flex-1">
                          {counterpart?.businessName ?? "—"}
                        </span>
                        {counterpart?.isVerified && <BadgeCheck className="size-3.5 text-accent" />}
                        {c.unreadCount > 0 && (
                          <span className="text-[10px] bg-accent text-white px-1.5 py-0.5 rounded-full">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground-secondary truncate mt-1">
                        {c.lastMessage?.content ?? "—"}
                      </p>
                      {c.contextRefTitle && (
                        <p className="text-[10px] text-foreground-tertiary mt-0.5 truncate">
                          RFQ: {c.contextRefTitle}
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col bg-background">
        {active ? (
          <>
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <span className="text-sm font-medium">{other?.businessName ?? "—"}</span>
              {other?.isVerified && <BadgeCheck className="size-3.5 text-accent" />}
              {active.contextRefTitle && (
                <span className="text-xs text-foreground-tertiary">· RFQ: {active.contextRefTitle}</span>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.length === 0 ? (
                <p className="text-xs text-foreground-tertiary text-center">No messages yet.</p>
              ) : (
                messages.map((m) => {
                  const mine = m.senderBusinessUid === business?.uid;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                          mine ? "bg-accent text-white" : "bg-background-secondary"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <div className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-foreground-tertiary"}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {mine && m.readAt && " · Read"}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending}
                className="h-9 px-3 rounded-md bg-accent text-white text-sm disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="size-3.5" /> Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-foreground-tertiary">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
