import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://weddingmarketplace.com";

const CATEGORIES = [
  "photographers", "venues", "caterers", "florists",
  "musicians", "planners", "beauty", "officiants",
];

const CITIES = ["melbourne", "sydney", "brisbane", "perth", "adelaide", "kathmandu", "pokhara"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vendors = await prisma.vendorProfile.findMany({
    where: { verificationStatus: "VERIFIED" },
    select: { slug: true, category: { select: { slug: true } }, updatedAt: true },
  });

  const realWeddings = await prisma.realWedding.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/vendors`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/real-weddings`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/register`, changeFrequency: "monthly", priority: 0.4 },
    ...CATEGORIES.map((cat) => ({
      url: `${BASE_URL}/vendors/${cat}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...CATEGORIES.flatMap((cat) =>
      CITIES.map((city) => ({
        url: `${BASE_URL}/vendors/${cat}/cities/${city}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    ),
  ];

  const vendorPages: MetadataRoute.Sitemap = vendors.map((v) => ({
    url: `${BASE_URL}/vendors/${v.category.slug}/${v.slug}`,
    lastModified: v.updatedAt,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const weddingPages: MetadataRoute.Sitemap = realWeddings.map((rw) => ({
    url: `${BASE_URL}/real-weddings/${rw.slug}`,
    lastModified: rw.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...vendorPages, ...weddingPages];
}
