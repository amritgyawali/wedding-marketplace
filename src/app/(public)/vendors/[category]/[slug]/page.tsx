import { notFound } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Separator } from "@/components/ui/separator";
import { InquiryForm } from "@/components/messaging/inquiry-form";
import { ReviewForm } from "@/components/reviews/review-form";
import { JsonLd, buildLocalBusinessSchema, buildBreadcrumbSchema } from "@/components/seo/structured-data";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate, truncate, slugToTitle } from "@/lib/utils";
import { auth } from "@/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Globe, Phone, Mail, Star, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await prisma.vendorProfile.findUnique({
    where: { slug },
    include: { category: true, media: { where: { isCover: true }, take: 1 } },
  });
  if (!vendor) return { title: "Vendor not found" };

  return {
    title: `${vendor.businessName} — Wedding ${vendor.category.name}`,
    description: truncate(vendor.description ?? vendor.tagline ?? `Book ${vendor.businessName} for your wedding`, 160),
    openGraph: {
      title: vendor.businessName,
      images: vendor.media[0]?.url ? [vendor.media[0].url] : [],
    },
  };
}

export default async function VendorProfilePage({ params }: Props) {
  const { category, slug } = await params;
  const session = await auth();

  const vendor = await prisma.vendorProfile.findUnique({
    where: { slug },
    include: {
      category: true,
      media: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      reviews: {
        where: { status: "APPROVED" },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      subscription: true,
      serviceAreas: true,
      user: { select: { name: true } },
    },
  });

  if (!vendor || vendor.category.slug !== category) notFound();

  await prisma.vendorProfile.update({
    where: { id: vendor.id },
    data: { profileViews: { increment: 1 } },
  }).catch(() => {});

  const coverImage = vendor.media.find((m) => m.isCover) ?? vendor.media[0];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const schema = buildLocalBusinessSchema({
    name: vendor.businessName,
    description: vendor.description ?? undefined,
    url: `${appUrl}/vendors/${category}/${slug}`,
    telephone: vendor.phone ?? undefined,
    address: vendor.city
      ? { addressLocality: vendor.city, addressCountry: vendor.country }
      : undefined,
    rating: vendor.reviewCount > 0 ? { value: vendor.avgRating, count: vendor.reviewCount } : undefined,
    priceRange: { BUDGET: "$", MID_RANGE: "$$", LUXURY: "$$$", ULTRA_LUXURY: "$$$$" }[vendor.priceTier],
  });

  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", url: appUrl },
    { name: vendor.category.name, url: `${appUrl}/vendors/${category}` },
    { name: vendor.businessName, url: `${appUrl}/vendors/${category}/${slug}` },
  ]);

  const isOwner = session?.user?.id === vendor.userId;
  const isCouple = session?.user?.role === "COUPLE";

  return (
    <>
      <JsonLd schema={schema} />
      <JsonLd schema={breadcrumbs} />
      <Navbar />
      <main className="flex-1">
        {/* Cover image */}
        <div className="relative h-72 sm:h-96 bg-gray-100">
          {coverImage ? (
            <Image src={coverImage.url} alt={vendor.businessName} fill className="object-cover" priority />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">No cover photo</div>
          )}
          {vendor.isFeatured && (
            <Badge className="absolute top-4 left-4">Featured</Badge>
          )}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <p className="text-sm text-pink-600 font-medium">{vendor.category.name}</p>
                <h1 className="text-3xl font-bold text-gray-900 mt-1">{vendor.businessName}</h1>
                {vendor.tagline && <p className="text-gray-600 mt-1">{vendor.tagline}</p>}

                <div className="flex flex-wrap items-center gap-4 mt-3">
                  {vendor.reviewCount > 0 && (
                    <div className="flex items-center gap-1">
                      <StarRating value={vendor.avgRating} readonly size="sm" />
                      <span className="font-medium">{vendor.avgRating.toFixed(1)}</span>
                      <span className="text-gray-500">({vendor.reviewCount} reviews)</span>
                    </div>
                  )}
                  {vendor.city && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{vendor.city}{vendor.state ? `, ${vendor.state}` : ""}</span>
                    </div>
                  )}
                  {vendor.verificationStatus === "VERIFIED" && (
                    <Badge variant="success">Verified</Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Description */}
              {vendor.description && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">About {vendor.businessName}</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{vendor.description}</p>
                </div>
              )}

              {/* Gallery */}
              {vendor.media.length > 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Gallery</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {vendor.media.slice(0, 9).map((m) => (
                      <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <Image src={m.url} alt={m.altText ?? vendor.businessName} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Reviews {vendor.reviewCount > 0 && `(${vendor.reviewCount})`}
                </h2>

                {vendor.reviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                ) : (
                  <div className="space-y-6">
                    {vendor.reviews.map((review) => (
                      <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-9 w-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-medium text-sm">
                            {review.user.name?.[0] ?? "?"}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{review.user.name}</p>
                            {review.weddingDate && (
                              <p className="text-xs text-gray-400">Married {formatDate(review.weddingDate)}</p>
                            )}
                          </div>
                        </div>
                        <StarRating value={review.rating} readonly size="sm" />
                        <h3 className="font-medium mt-1.5">{review.title}</h3>
                        <p className="text-gray-700 text-sm mt-1">{review.body}</p>

                        {review.vendorReply && (
                          <div className="mt-3 ml-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 mb-1">Response from {vendor.businessName}</p>
                            <p className="text-sm text-gray-700">{review.vendorReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isCouple && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Write a Review</h3>
                    <ReviewForm vendorId={vendor.id} />
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Inquiry card */}
              <div className="sticky top-24 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                {vendor.priceFrom && (
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    From {formatPrice(vendor.priceFrom)}
                  </p>
                )}
                {!vendor.priceFrom && (
                  <p className="text-gray-600 mb-3">Contact for pricing</p>
                )}

                {isOwner ? (
                  <a href="/dashboard/vendor/profile" className="block w-full">
                    <Button variant="outline" className="w-full">Edit Profile</Button>
                  </a>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">Send Inquiry</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contact {vendor.businessName}</DialogTitle>
                      </DialogHeader>
                      {session ? (
                        <InquiryForm vendorId={vendor.id} vendorName={vendor.businessName} />
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-600 mb-4">Sign in to send an inquiry</p>
                          <a href="/login"><Button>Sign in</Button></a>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                )}

                <div className="mt-4 space-y-2 text-sm">
                  {vendor.phone && (
                    <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-pink-600">
                      <Phone className="h-4 w-4" /> {vendor.phone}
                    </a>
                  )}
                  {vendor.email && (
                    <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 text-gray-600 hover:text-pink-600">
                      <Mail className="h-4 w-4" /> {vendor.email}
                    </a>
                  )}
                  {vendor.website && (
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-pink-600">
                      <Globe className="h-4 w-4" /> Website
                    </a>
                  )}
                  {vendor.instagramUrl && (
                    <a href={vendor.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-pink-600">
                      <ExternalLink className="h-4 w-4" /> Instagram
                    </a>
                  )}
                </div>
              </div>

              {/* Quick facts */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold mb-3">Quick Facts</h3>
                <dl className="space-y-2 text-sm">
                  {vendor.yearsInBusiness && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Experience</dt>
                      <dd className="font-medium">{vendor.yearsInBusiness}+ years</dd>
                    </div>
                  )}
                  {vendor.teamSize && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Team size</dt>
                      <dd className="font-medium">{vendor.teamSize} people</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Price range</dt>
                    <dd className="font-medium">
                      {{ BUDGET: "$", MID_RANGE: "$$", LUXURY: "$$$", ULTRA_LUXURY: "$$$$" }[vendor.priceTier]}
                    </dd>
                  </div>
                  {vendor.serviceAreas.length > 0 && (
                    <div>
                      <dt className="text-gray-500 mb-1">Service areas</dt>
                      <dd className="flex flex-wrap gap-1">
                        {vendor.serviceAreas.slice(0, 4).map((area) => (
                          <Badge key={area.id} variant="secondary" className="text-xs">
                            {area.city}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
