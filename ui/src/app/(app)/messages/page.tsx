"use client";

import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-border overflow-hidden">
      {/* Conversation list */}
      <div className="w-72 border-r border-border bg-background flex flex-col">
        <div className="p-3 border-b border-border">
          <input
            placeholder="Search messages..."
            className="w-full h-8 rounded-md border border-input bg-transparent px-2.5 text-sm outline-none placeholder:text-foreground-tertiary"
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-foreground-tertiary">No conversations yet</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background-secondary">
        <div className="size-12 rounded-full bg-background flex items-center justify-center mb-3">
          <MessageSquare className="size-6 text-foreground-tertiary" />
        </div>
        <p className="text-sm text-foreground-secondary">Select a conversation</p>
        <p className="text-xs text-foreground-tertiary mt-1">Messages from RFQs and connections appear here</p>
      </div>
    </div>
  );
}
