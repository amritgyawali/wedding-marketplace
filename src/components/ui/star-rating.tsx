"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZES = { xs: "size-3", sm: "size-4", md: "size-5", lg: "size-8" };
const LABELS = ["Poor", "Fair", "Good", "Great", "Exceptional"];

export function StarRating({ value, onChange, readonly = false, size = "md", className }: StarRatingProps) {
  const [hovered, setHovered] = React.useState(0);
  const starSize = SIZES[size];

  if (readonly) {
    // Fractional fill so a 4.7 average reads as 4.7, not 5.
    return (
      <div
        className={cn("flex items-center gap-0.5", className)}
        role="img"
        aria-label={`Rated ${value.toFixed(1)} out of 5`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.max(0, Math.min(1, value - (star - 1)));
          return (
            <span key={star} className={cn("relative inline-block", starSize)}>
              <Star className={cn(starSize, "absolute inset-0 fill-muted text-muted")} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={cn(starSize, "fill-champagne-500 text-champagne-500")} />
              </span>
            </span>
          );
        })}
      </div>
    );
  }

  const active = hovered || value;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""} — ${LABELS[star - 1]}`}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="rounded-md transition-transform duration-150 hover:scale-110 active:scale-95"
          >
            <Star
              className={cn(
                starSize,
                "transition-colors",
                star <= active ? "fill-champagne-500 text-champagne-500" : "fill-transparent text-border"
              )}
            />
          </button>
        ))}
      </div>
      {active > 0 && (
        <span className="text-sm font-medium text-muted-foreground animate-fade-in">{LABELS[active - 1]}</span>
      )}
    </div>
  );
}
