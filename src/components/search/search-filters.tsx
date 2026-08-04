"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const PRICE_TIERS = [
  { label: "Budget ($)", value: "BUDGET" },
  { label: "Mid-range ($$)", value: "MID_RANGE" },
  { label: "Luxury ($$$)", value: "LUXURY" },
  { label: "Ultra-luxury ($$$$)", value: "ULTRA_LUXURY" },
];

const SORT_OPTIONS = [
  { label: "Best match", value: "featured" },
  { label: "Highest rated", value: "rating" },
  { label: "Price: low to high", value: "price_asc" },
  { label: "Price: high to low", value: "price_desc" },
  { label: "Newest", value: "newest" },
];

export function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const togglePriceTier = (tier: string) => {
    const current = searchParams.getAll("priceTier");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("priceTier");
    const next = current.includes(tier)
      ? current.filter((t) => t !== tier)
      : [...current, tier];
    next.forEach((t) => params.append("priceTier", t));
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const selectedTiers = searchParams.getAll("priceTier");
  const sort = searchParams.get("sort") ?? "featured";
  const minRating = searchParams.get("minRating") ?? "";

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold text-gray-900 mb-2 block">Sort by</Label>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={sort === opt.value}
                onChange={() => update("sort", opt.value)}
                className="accent-pink-600"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-900 mb-2 block">Budget</Label>
        <div className="space-y-1.5">
          {PRICE_TIERS.map((tier) => (
            <label key={tier.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTiers.includes(tier.value)}
                onChange={() => togglePriceTier(tier.value)}
                className="accent-pink-600"
              />
              <span className="text-sm text-gray-700">{tier.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-900 mb-2 block">
          Minimum rating
        </Label>
        <div className="space-y-1.5">
          {[4.5, 4, 3].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="minRating"
                value={r}
                checked={minRating === String(r)}
                onChange={() => update("minRating", String(r))}
                className="accent-pink-600"
              />
              <span className="text-sm text-gray-700">{r}+ stars</span>
            </label>
          ))}
          {minRating && (
            <button
              onClick={() => update("minRating", "")}
              className="text-xs text-pink-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-900 mb-2 block">City</Label>
        <Input
          placeholder="e.g. Melbourne"
          defaultValue={searchParams.get("city") ?? ""}
          onBlur={(e) => update("city", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") update("city", (e.target as HTMLInputElement).value);
          }}
        />
      </div>
    </div>
  );
}
