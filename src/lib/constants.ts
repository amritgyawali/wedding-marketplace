import {
  Camera,
  Landmark,
  UtensilsCrossed,
  Flower2,
  Music,
  ClipboardList,
  Sparkles,
  HandHeart,
  type LucideIcon,
} from "lucide-react";
import type { PriceTier } from "@prisma/client";

export interface CategoryMeta {
  name: string;
  /** Shorter label for tight spaces like chips and nav. */
  short: string;
  slug: string;
  icon: LucideIcon;
  description: string;
  /** OKLCH hue used to tint placeholders and category tiles. */
  hue: number;
}

export const CATEGORIES: CategoryMeta[] = [
  { name: "Photographers", short: "Photo", slug: "photographers", icon: Camera, description: "Capture every candid, golden-hour moment", hue: 250 },
  { name: "Wedding Venues", short: "Venues", slug: "venues", icon: Landmark, description: "Estates, gardens, ballrooms & beyond", hue: 155 },
  { name: "Caterers", short: "Catering", slug: "caterers", icon: UtensilsCrossed, description: "Menus your guests will talk about", hue: 40 },
  { name: "Florists", short: "Florals", slug: "florists", icon: Flower2, description: "Blooms, installations & styling", hue: 350 },
  { name: "Musicians & DJs", short: "Music", slug: "musicians", icon: Music, description: "Ceremony strings to dance-floor anthems", hue: 300 },
  { name: "Wedding Planners", short: "Planners", slug: "planners", icon: ClipboardList, description: "Calm, expert coordination end to end", hue: 200 },
  { name: "Hair & Makeup", short: "Beauty", slug: "beauty", icon: Sparkles, description: "Look and feel your most radiant", hue: 15 },
  { name: "Officiants", short: "Officiants", slug: "officiants", icon: HandHeart, description: "Ceremonies that feel truly yours", hue: 75 },
];

export const CATEGORY_BY_SLUG: Record<string, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c])
);

export interface CityMeta {
  name: string;
  slug: string;
  country: string;
  tagline: string;
  hue: number;
}

export const CITIES: CityMeta[] = [
  { name: "Melbourne", slug: "melbourne", country: "Australia", tagline: "Laneway chic & Yarra Valley vineyards", hue: 250 },
  { name: "Sydney", slug: "sydney", country: "Australia", tagline: "Harbour views & coastal ceremonies", hue: 200 },
  { name: "Kathmandu", slug: "kathmandu", country: "Nepal", tagline: "Heritage courtyards & vibrant traditions", hue: 30 },
  { name: "Brisbane", slug: "brisbane", country: "Australia", tagline: "Sun-soaked river & hinterland escapes", hue: 70 },
  { name: "Perth", slug: "perth", country: "Australia", tagline: "Swan Valley estates & Indian Ocean sunsets", hue: 15 },
  { name: "Adelaide", slug: "adelaide", country: "Australia", tagline: "Barossa cellar doors & stone chapels", hue: 320 },
  { name: "Pokhara", slug: "pokhara", country: "Nepal", tagline: "Lakeside vows beneath the Annapurnas", hue: 165 },
];

export const PRICE_TIERS: { value: PriceTier; label: string; symbol: string; hint: string }[] = [
  { value: "BUDGET", label: "Budget", symbol: "$", hint: "Great value" },
  { value: "MID_RANGE", label: "Mid-range", symbol: "$$", hint: "Most popular" },
  { value: "LUXURY", label: "Luxury", symbol: "$$$", hint: "Premium service" },
  { value: "ULTRA_LUXURY", label: "Ultra-luxury", symbol: "$$$$", hint: "No compromises" },
];

export const PRICE_SYMBOL: Record<PriceTier, string> = {
  BUDGET: "$",
  MID_RANGE: "$$",
  LUXURY: "$$$",
  ULTRA_LUXURY: "$$$$",
};

export const SORT_OPTIONS = [
  { label: "Recommended", value: "featured" },
  { label: "Highest rated", value: "rating" },
  { label: "Price: low to high", value: "price_asc" },
  { label: "Price: high to low", value: "price_desc" },
  { label: "Newest", value: "newest" },
] as const;
