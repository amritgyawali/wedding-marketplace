import { prisma } from "@/lib/prisma";
import { VerificationStatus } from "@prisma/client";
import type {
  SearchAdapter,
  SearchResponse,
  VendorSearchParams,
  VendorSearchResult,
} from "./types";

export class PrismaSearchAdapter implements SearchAdapter {
  async search(params: VendorSearchParams): Promise<SearchResponse> {
    const {
      query,
      category,
      city,
      country,
      priceTier,
      minRating,
      page = 1,
      limit = 12,
      sort = "featured",
    } = params;

    const where: Record<string, unknown> = {
      verificationStatus: VerificationStatus.VERIFIED,
    };

    if (query) {
      where.OR = [
        { businessName: { contains: query, mode: "insensitive" } },
        { tagline: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (city) {
      where.OR = [
        { city: { contains: city, mode: "insensitive" } },
        {
          serviceAreas: {
            some: { city: { contains: city, mode: "insensitive" } },
          },
        },
      ];
    }

    if (country) {
      where.country = country;
    }

    if (priceTier && priceTier.length > 0) {
      where.priceTier = { in: priceTier };
    }

    if (minRating) {
      where.avgRating = { gte: minRating };
    }

    const orderBy = buildOrderBy(sort);

    const [vendors, total] = await Promise.all([
      prisma.vendorProfile.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { name: true, slug: true } },
          media: {
            where: { isCover: true },
            take: 1,
            select: { url: true },
          },
          subscription: { select: { tier: true } },
        },
      }),
      prisma.vendorProfile.count({ where }),
    ]);

    const results: VendorSearchResult[] = vendors.map((v) => ({
      id: v.id,
      businessName: v.businessName,
      slug: v.slug,
      tagline: v.tagline,
      city: v.city,
      country: v.country,
      priceTier: v.priceTier,
      priceFrom: v.priceFrom,
      avgRating: v.avgRating,
      reviewCount: v.reviewCount,
      isFeatured: v.isFeatured,
      coverImage: v.media[0]?.url ?? null,
      categorySlug: v.category.slug,
      categoryName: v.category.name,
      tier: v.subscription?.tier ?? "FREE",
    }));

    return {
      results,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

function buildOrderBy(sort: string) {
  switch (sort) {
    case "rating":
      return [{ isFeatured: "desc" }, { avgRating: "desc" }];
    case "price_asc":
      return [{ isFeatured: "desc" }, { priceFrom: "asc" }];
    case "price_desc":
      return [{ isFeatured: "desc" }, { priceFrom: "desc" }];
    case "newest":
      return [{ isFeatured: "desc" }, { createdAt: "desc" }];
    default:
      return [
        { isFeatured: "desc" },
        { subscription: { tier: "desc" } },
        { avgRating: "desc" },
      ];
  }
}

export const searchService = new PrismaSearchAdapter();
