"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { timeAgo, getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { Message } from "@prisma/client";

interface MessageThreadProps {
  conversationId: string;
}

export function MessageThread({ conversationId }: MessageThreadProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string | null>(null);

  const fetchMessages = async () => {
    const after = lastMessageRef.current
      ? `?after=${lastMessageRef.current}`
      : "";
    const res = await fetch(`/api/conversations/${conversationId}/messages${after}`);
    if (!res.ok) return;
    const data: Message[] = await res.json();
    if (data.length > 0) {
      setMessages((prev) => [...prev, ...data]);
      lastMessageRef.current = data[data.length - 1].createdAt.toString();
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const send = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        setBody("");
        await fetchMessages();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>{isMe ? getInitials(user?.name ?? "Me") : "?"}</AvatarFallback>
              </Avatar>
              <div className={`max-w-[70%] ${isMe ? "items-end" : ""} flex flex-col`}>
                <div
                  className={`rounded-xl px-3 py-2 text-sm ${
                    isMe
                      ? "bg-pink-600 text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}
                >
                  {msg.body}
                </div>
                <span className="text-xs text-gray-400 mt-0.5">
                  {timeAgo(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-4 flex gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..."
          rows={2}
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <Button onClick={send} disabled={sending || !body.trim()}>
          {sending ? "..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
