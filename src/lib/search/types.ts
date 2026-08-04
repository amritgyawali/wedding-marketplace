import { PriceTier, SubscriptionTier } from "@prisma/client";

export interface VendorSearchParams {
  query?: string;
  category?: string;
  city?: string;
  country?: string;
  priceTier?: PriceTier[];
  minRating?: number;
  page?: number;
  limit?: number;
  sort?: "rating" | "price_asc" | "price_desc" | "newest" | "featured";
}

export interface VendorSearchResult {
  id: string;
  businessName: string;
  slug: string;
  tagline: string | null;
  city: string | null;
  country: string;
  priceTier: PriceTier;
  priceFrom: number | null;
  avgRating: number;
  reviewCount: number;
  isFeatured: boolean;
  coverImage: string | null;
  categorySlug: string;
  categoryName: string;
  tier: SubscriptionTier;
}

export interface SearchResponse {
  results: VendorSearchResult[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SearchAdapter {
  search(params: VendorSearchParams): Promise<SearchResponse>;
}
