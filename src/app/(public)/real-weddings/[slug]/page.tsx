import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const wedding = await prisma.realWedding.findUnique({ where: { slug } });
  if (!wedding) return { title: "Not found" };
  return {
    title: wedding.title,
    description: wedding.description ?? `Beautiful real wedding: ${wedding.title}`,
  };
}

export default async function RealWeddingPage({ params }: Props) {
  const { slug } = await params;

  const wedding = await prisma.realWedding.findUnique({
    where: { slug, isPublished: true },
    include: {
      vendor: {
        include: { category: true, media: { where: { isCover: true }, take: 1 } },
      },
    },
  });

  if (!wedding) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {wedding.coverImage && (
          <div className="relative h-72 sm:h-96 bg-gray-100">
            <Image src={wedding.coverImage} alt={wedding.title} fill className="object-cover" priority />
          </div>
        )}

        <div className="mx-auto max-w-4xl px-4 py-10">
          <h1 className="text-3xl font-bold text-gray-900">{wedding.title}</h1>
          <div className="flex gap-4 mt-2 text-gray-500 text-sm">
            {wedding.weddingDate && <span>{formatDate(wedding.weddingDate)}</span>}
            {wedding.venue && <span>at {wedding.venue}</span>}
            {wedding.city && <span>{wedding.city}</span>}
          </div>

          {wedding.description && (
            <p className="mt-6 text-gray-700 leading-relaxed">{wedding.description}</p>
          )}

          {wedding.images.length > 0 && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wedding.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image src={img} alt={`${wedding.title} - photo ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          {wedding.vendor && (
            <div className="mt-10 p-6 bg-pink-50 rounded-xl">
              <h2 className="font-semibold text-gray-900 mb-2">Vendors Featured</h2>
              <div className="flex items-center gap-4">
                {wedding.vendor.media[0] && (
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image src={wedding.vendor.media[0].url} alt={wedding.vendor.businessName} fill className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-pink-600">{wedding.vendor.category.name}</p>
                  <p className="font-medium">{wedding.vendor.businessName}</p>
                  <Link
                    href={`/vendors/${wedding.vendor.category.slug}/${wedding.vendor.slug}`}
                    className="text-xs text-pink-600 hover:underline"
                  >
                    View profile →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
