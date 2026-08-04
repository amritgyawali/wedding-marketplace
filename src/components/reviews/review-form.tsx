"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/star-rating";
import { CreateReviewSchema, type CreateReviewInput } from "@/schemas/review";

interface ReviewFormProps {
  vendorId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ vendorId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(CreateReviewSchema),
    defaultValues: { vendorId },
  });

  const onSubmit = async (data: CreateReviewInput) => {
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, rating }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Failed to submit review");
        return;
      }

      reset();
      setRating(0);
      onSuccess?.();
    } catch {
      setError("Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Your Rating</Label>
        <StarRating value={rating} onChange={setRating} size="lg" className="mt-1" />
        {rating === 0 && <p className="text-xs text-red-500 mt-1">Please select a rating</p>}
      </div>

      <div>
        <Label htmlFor="title">Review Title</Label>
        <Input id="title" {...register("title")} placeholder="Sum up your experience" className="mt-1" />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="body">Your Review</Label>
        <Textarea
          id="body"
          {...register("body")}
          placeholder="Tell other couples about your experience..."
          rows={5}
          className="mt-1"
        />
        {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>}
      </div>

      <div>
        <Label htmlFor="weddingDate">Wedding Date (optional)</Label>
        <Input id="weddingDate" type="date" {...register("weddingDate")} className="mt-1" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isSubmitting || rating === 0}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
