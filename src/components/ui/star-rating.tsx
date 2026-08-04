"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({ value, onChange, readonly = false, size = "md", className }: StarRatingProps) {
  const [hovered, setHovered] = React.useState(0);

  const sizeMap = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };
  const starSize = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={cn("focus:outline-none", readonly ? "cursor-default" : "cursor-pointer")}
          >
            <Star
              className={cn(
                starSize,
                filled ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
