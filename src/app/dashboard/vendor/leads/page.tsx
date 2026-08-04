"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageThread } from "@/components/messaging/message-thread";
import { formatDate, timeAgo } from "@/lib/utils";

interface Inquiry {
  id: string;
  status: string;
  message: string;
  eventDate: string | null;
  guestCount: number | null;
  budget: number | null;
  createdAt: string;
  couple: {
    user: { name: string; email: string; image: string | null };
  };
  conversations: Array<{ id: string; lastMessageAt: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "default",
  REPLIED: "secondary",
  BOOKED: "success",
  CLOSED: "outline",
};

export default function LeadsPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inquiries")
      .then((r) => r.json())
      .then((data) => {
        setInquiries(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading leads...</div>;

  return (
    <div className="p-6 h-full flex gap-6">
      <div className="w-80 space-y-3 overflow-y-auto">
        <h1 className="text-xl font-bold text-gray-900">Leads</h1>
        {inquiries.length === 0 ? (
          <p className="text-gray-500 text-sm">No leads yet. Complete your profile to attract couples.</p>
        ) : (
          inquiries.map((inq) => (
            <Card
              key={inq.id}
              className={`cursor-pointer hover:border-pink-300 transition-colors ${selected?.id === inq.id ? "border-pink-500" : ""}`}
              onClick={() => setSelected(inq)}
            >
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{inq.couple.user.name}</p>
                  <Badge variant={STATUS_COLORS[inq.status] as never}>{inq.status}</Badge>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{inq.message}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(inq.createdAt)}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selected ? (
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b flex items-start justify-between">
            <div>
              <h2 className="font-semibold">{selected.couple.user.name}</h2>
              <p className="text-xs text-gray-500">{selected.couple.user.email}</p>
              <div className="flex gap-3 mt-1 text-xs text-gray-500">
                {selected.eventDate && <span>Date: {formatDate(selected.eventDate)}</span>}
                {selected.guestCount && <span>{selected.guestCount} guests</span>}
                {selected.budget && <span>Budget: ${selected.budget}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              {selected.status === "NEW" && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, "BOOKED")}>
                  Mark Booked
                </Button>
              )}
              {selected.status !== "CLOSED" && (
                <Button size="sm" variant="ghost" onClick={() => updateStatus(selected.id, "CLOSED")}>
                  Close
                </Button>
              )}
            </div>
          </div>

          {selected.conversations[0] ? (
            <div className="flex-1 overflow-hidden">
              <MessageThread conversationId={selected.conversations[0].id} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              No conversation yet
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 bg-white rounded-xl border border-gray-200">
          Select a lead to view the conversation
        </div>
      )}
    </div>
  );
}
