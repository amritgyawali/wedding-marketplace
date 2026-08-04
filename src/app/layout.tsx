import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "WedMarket — Find Wedding Vendors in Australia & Nepal",
    template: "%s | WedMarket",
  },
  description:
    "Discover and book the best wedding vendors — photographers, venues, caterers, florists & more across Melbourne, Sydney, Kathmandu and worldwide.",
  keywords: ["wedding vendors", "wedding marketplace", "wedding photographers", "wedding venues Australia"],
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "WedMarket",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
