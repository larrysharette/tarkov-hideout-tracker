import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";
import "./globals.css";

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
      "Tarkov Hideout Tracker - Track Your Escape from Tarkov Hideout Upgrades",
    template: "%s | Tarkov Hideout Tracker",
  },
  description:
    "Track your Escape from Tarkov hideout upgrade requirements, manage inventory, and plan your upgrade path. Calculate item requirements for focused upgrades and future needs.",
  keywords: [
    "escape from tarkov",
    "tarkov",
    "hideout tracker",
    "hideout upgrades",
    "tarkov hideout",
    "tarkov items",
    "tarkov inventory",
    "tarkov calculator",
    "eft hideout",
    "tarkov planner",
  ],
  authors: [{ name: "Tarkov Tracker" }],
  creator: "Tarkov Tracker",
  publisher: "Tarkov Tracker",
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
    siteName: "Tarkov Hideout Tracker",
    title:
      "Tarkov Hideout Tracker - Track Your Escape from Tarkov Hideout Upgrades",
    description:
      "Track your Escape from Tarkov hideout upgrade requirements, manage inventory, and plan your upgrade path. Calculate item requirements for focused upgrades and future needs.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tarkov Hideout Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Tarkov Hideout Tracker - Track Your Escape from Tarkov Hideout Upgrades",
    description:
      "Track your Escape from Tarkov hideout upgrade requirements, manage inventory, and plan your upgrade path.",
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
    name: "Tarkov Hideout Tracker",
    description:
      "Track your Escape from Tarkov hideout upgrade requirements, manage inventory, and plan your upgrade path.",
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
      "Inventory management",
      "Item requirement calculator",
      "Upgrade path planning",
      "Shopping list generation",
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
        {children}
      </body>
    </html>
  );
}
