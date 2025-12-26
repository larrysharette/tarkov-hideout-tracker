import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { Navigation } from "@/components/Navigation";
import { QuestProvider } from "@/contexts/QuestContext";
import { HideoutProvider } from "@/contexts/HideoutContext";

const notoSans = Noto_Sans({ variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "Adin's Tarkov Tracker - Complete Escape from Tarkov Progress Tracker",
    template: "%s | Adin's Tarkov Tracker",
  },
  description:
    "Comprehensive Escape from Tarkov tracker for hideout upgrades, task progression, inventory management, and item watchlists. Track hideout station levels, trader requirements, quest completion, and plan your upgrade path. Calculate item requirements, manage your inventory, and never miss a task objective.",
  keywords: [
    "escape from tarkov",
    "tarkov",
    "tarkov tracker",
    "hideout tracker",
    "hideout upgrades",
    "tarkov hideout",
    "tarkov tasks",
    "tarkov quests",
    "tarkov quest tracker",
    "tarkov task tracker",
    "tarkov items",
    "tarkov inventory",
    "tarkov inventory tracker",
    "tarkov watchlist",
    "tarkov calculator",
    "eft hideout",
    "eft tracker",
    "tarkov planner",
    "kappa quests",
    "tarkov progression",
  ],
  authors: [{ name: "Adin" }],
  creator: "Adin",
  publisher: "Adin's Tarkov Tracker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://tarkov-hideout-tracker-one.vercel.app"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Adin's Tarkov Tracker",
    title:
      "Adin's Tarkov Tracker - Complete Escape from Tarkov Progress Tracker",
    description:
      "Comprehensive Escape from Tarkov tracker for hideout upgrades, task progression, inventory management, and item watchlists. Track station levels, quest completion, and plan your upgrade path.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Adin's Tarkov Tracker - Complete Escape from Tarkov Progress Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Adin's Tarkov Tracker - Complete Escape from Tarkov Progress Tracker",
    description:
      "Comprehensive Escape from Tarkov tracker for hideout upgrades, task progression, inventory management, and item watchlists.",
    images: ["/og-image.png"],
    creator: "@tarkovtracker",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  category: "Gaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://tarkov-hideout-tracker-one.vercel.app";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Adin's Tarkov Tracker",
    description:
      "Comprehensive Escape from Tarkov tracker for hideout upgrades, task progression, inventory management, and item watchlists.",
    url: siteUrl,
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Hideout upgrade tracking",
      "Station and trader level management",
      "Task and quest progression tracking",
      "Inventory management and raid recording",
      "Item watchlist with automatic quantity tracking",
      "Item requirement calculator",
      "Upgrade path planning",
      "Shopping list generation",
      "Kappa quest filtering",
      "Task filtering by map and status",
    ],
    about: {
      "@type": "VideoGame",
      name: "Escape from Tarkov",
      genre: "First-person shooter",
    },
  };

  return (
    <html lang="en" className={`${notoSans.variable} dark`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Navigation />

        <HideoutProvider>
          <QuestProvider>
            <main className="min-h-[calc(100vh-58px)]">{children}</main>
          </QuestProvider>
        </HideoutProvider>
        <Analytics />
      </body>
    </html>
  );
}
