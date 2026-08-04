"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { timeAgo } from "@/lib/utils";

interface Review {
  id: string;
  title: string;
  body: string;
  rating: number;
  status: string;
  createdAt: string;
  user: { name: string };
  vendor: { businessName: string };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");

  useEffect(() => {
    fetch(`/api/reviews?status=${filter}&admin=1`)
      .then((r) => r.json())
      .then((data) => { setReviews(Array.isArray(data) ? data : []); setLoading(false); });
  }, [filter]);

  const moderate = async (id: string, status: "APPROVED" | "REJECTED") => {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>

      <div className="flex gap-2">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">No {filter.toLowerCase()} reviews.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating value={review.rating} readonly size="sm" />
                      <Badge variant="secondary">{review.vendor?.businessName}</Badge>
                      <span className="text-xs text-gray-400">by {review.user?.name} • {timeAgo(review.createdAt)}</span>
                    </div>
                    <h3 className="font-medium">{review.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{review.body}</p>
                  </div>
                  {filter === "PENDING" && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" onClick={() => moderate(review.id, "APPROVED")}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => moderate(review.id, "REJECTED")}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
