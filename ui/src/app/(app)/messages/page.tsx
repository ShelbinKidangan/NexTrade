"use client";

import { useMemo, useState } from "react";
import { Search, Send, Paperclip, Smile, BadgeCheck } from "lucide-react";
import { mockConversations, timeAgo } from "@/lib/mock-data";

export default function MessagesPage() {
  const [activeUid, setActiveUid] = useState(mockConversations[0]?.uid);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");

  const conversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockConversations;
    return mockConversations.filter(
      (c) =>
        c.businessName.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [search]);

  const active = mockConversations.find((c) => c.uid === activeUid);

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
          {conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-foreground-tertiary">No conversations</p>
            </div>
          ) : (
            <ul>
              {conversations.map((c) => {
                const isActive = c.uid === activeUid;
                return (
                  <li key={c.uid}>
                    <button
                      onClick={() => setActiveUid(c.uid)}
                      className={`w-full text-left px-3 py-3 border-b border-border transition-colors ${
                        isActive ? "bg-background-secondary" : "hover:bg-background-secondary/60"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="relative shrink-0">
                          <div className="flex size-9 items-center justify-center rounded-full bg-accent-subtle text-accent text-sm font-medium">
                            {c.businessName.charAt(0)}
                          </div>
                          {c.online && (
                            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success border-2 border-background" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-medium truncate">{c.businessName}</span>
                            <span className="text-[10px] text-foreground-tertiary shrink-0">
                              {timeAgo(c.lastMessageAt)}
                            </span>
                          </div>
                          <div className="text-[11px] text-foreground-tertiary truncate">{c.context}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <p className="text-xs text-foreground-secondary truncate flex-1">
                              {c.lastMessage}
                            </p>
                            {c.unread > 0 && (
                              <span className="shrink-0 size-4 rounded-full bg-accent text-white text-[10px] font-semibold flex items-center justify-center">
                                {c.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Chat area */}
      {active ? (
        <div className="flex-1 flex flex-col bg-background">
          {/* Header */}
          <div className="h-14 border-b border-border px-4 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-accent-subtle text-accent text-sm font-medium">
              {active.businessName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium truncate">{active.businessName}</span>
                <BadgeCheck className="size-3.5 text-accent shrink-0" />
              </div>
              <div className="text-[11px] text-foreground-tertiary">
                {active.online ? "● Online" : "Offline"} · {active.context}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background-secondary/30">
            {active.messages.map((m) => {
              const mine = m.sender === "me";
              return (
                <div key={m.uid} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-md ${mine ? "items-end" : "items-start"} flex flex-col`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-sm ${
                        mine
                          ? "bg-accent text-white rounded-br-sm"
                          : "bg-background border border-border rounded-bl-sm"
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[10px] text-foreground-tertiary mt-1 px-1">
                      {new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composer */}
          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDraft("");
              }}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1"
            >
              <button type="button" className="p-1 text-foreground-tertiary hover:text-foreground">
                <Paperclip className="size-4" />
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-tertiary py-1.5"
              />
              <button type="button" className="p-1 text-foreground-tertiary hover:text-foreground">
                <Smile className="size-4" />
              </button>
              <button
                type="submit"
                disabled={!draft.trim()}
                className="flex size-7 items-center justify-center rounded-md bg-accent text-white disabled:opacity-40"
              >
                <Send className="size-3.5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-background-secondary">
          <p className="text-sm text-foreground-secondary">Select a conversation</p>
        </div>
      )}
    </div>
  );
}
