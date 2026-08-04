import { z } from "zod";
import { PriceTier } from "@prisma/client";

export const VendorProfileSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  tagline: z.string().max(150).optional(),
  description: z.string().max(3000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("AU"),
  priceTier: z.nativeEnum(PriceTier).default(PriceTier.MID_RANGE),
  priceFrom: z.number().positive().optional(),
  priceTo: z.number().positive().optional(),
  yearsInBusiness: z.number().int().min(0).max(100).optional(),
  teamSize: z.number().int().min(1).optional(),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().optional(),
});

export const VendorSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  priceTier: z.array(z.nativeEnum(PriceTier)).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(48).default(12),
  sort: z
    .enum(["rating", "price_asc", "price_desc", "newest", "featured"])
    .default("featured"),
});

export type VendorProfileInput = z.infer<typeof VendorProfileSchema>;
export type VendorSearchInput = z.infer<typeof VendorSearchSchema>;
