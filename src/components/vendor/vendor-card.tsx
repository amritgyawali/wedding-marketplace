"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatRating } from "@/lib/utils";
import type { VendorSearchResult } from "@/lib/search/types";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface VendorCardProps {
  vendor: VendorSearchResult;
  isFavorite?: boolean;
  onFavoriteToggle?: (vendorId: string, isFavorite: boolean) => void;
}

export function VendorCard({ vendor, isFavorite = false, onFavoriteToggle }: VendorCardProps) {
  const { isCouple } = useAuth();
  const [fav, setFav] = useState(isFavorite);
  const [toggling, setToggling] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isCouple || toggling) return;
    setToggling(true);
    try {
      const method = fav ? "DELETE" : "POST";
      await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: vendor.id }),
      });
      setFav(!fav);
      onFavoriteToggle?.(vendor.id, !fav);
    } finally {
      setToggling(false);
    }
  };

  const href = `/vendors/${vendor.categorySlug}/${vendor.slug}`;
  const priceTierLabel = {
    BUDGET: "$",
    MID_RANGE: "$$",
    LUXURY: "$$$",
    ULTRA_LUXURY: "$$$$",
  }[vendor.priceTier];

  return (
    <Link href={href} className="group block">
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition-shadow">
        <div className="relative aspect-[4/3] bg-gray-100">
          {vendor.coverImage ? (
            <Image
              src={vendor.coverImage}
              alt={vendor.businessName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">No photo</div>
          )}

          {vendor.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-pink-600 text-white">Featured</Badge>
          )}

          {isCouple && (
            <button
              onClick={handleFavorite}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow"
            >
              <Heart className={cn("h-4 w-4", fav ? "fill-pink-500 text-pink-500" : "text-gray-400")} />
            </button>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-pink-600 font-medium mb-0.5">{vendor.categoryName}</p>
              <h3 className="font-semibold text-gray-900 leading-tight">{vendor.businessName}</h3>
            </div>
            <span className="text-sm text-gray-500 shrink-0">{priceTierLabel}</span>
          </div>

          {vendor.city && (
            <div className="flex items-center gap-1 mt-1.5 text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-xs">{vendor.city}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{formatRating(vendor.avgRating)}</span>
              <span className="text-xs text-gray-400">({vendor.reviewCount})</span>
            </div>
            {vendor.priceFrom && (
              <span className="text-sm text-gray-600">From {formatPrice(vendor.priceFrom)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
