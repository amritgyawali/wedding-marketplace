import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Real Weddings — Inspiration & Stories",
  description: "Get inspired by real weddings from couples across Australia and Nepal. Browse stunning photos and vendor recommendations.",
};

export default async function RealWeddingsPage() {
  const weddings = await prisma.realWedding.findMany({
    where: { isPublished: true },
    include: {
      vendor: { select: { businessName: true, category: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 py-14 px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Real Weddings</h1>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Get inspired by beautiful real weddings. See what&apos;s possible for your special day.
          </p>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12">
          {weddings.length === 0 ? (
            <p className="text-center text-gray-500 py-16">No real weddings published yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {weddings.map((wedding) => (
                <Link key={wedding.id} href={`/real-weddings/${wedding.slug}`} className="group block">
                  <div className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="relative aspect-[4/3] bg-gray-100">
                      {wedding.coverImage ? (
                        <Image
                          src={wedding.coverImage}
                          alt={wedding.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">No photo</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="font-semibold text-gray-900 group-hover:text-pink-700">{wedding.title}</h2>
                      {wedding.weddingDate && (
                        <p className="text-sm text-gray-500 mt-1">{formatDate(wedding.weddingDate)}</p>
                      )}
                      {wedding.city && <p className="text-xs text-gray-400">{wedding.city}</p>}
                      {wedding.vendor && (
                        <p className="text-xs text-pink-600 mt-1">
                          {wedding.vendor.category.name}: {wedding.vendor.businessName}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
