import type { Metadata } from "next";
import "./globals.css";
import LocalSchema from "../components/LocalSchema";
import MetaPixel from "../components/MetaPixel";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scalinghomeservices.com";
const logoPath = "/Gallery/LogoTransparent.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "10 Free Closed Bookings For Your Home Service Business",
  description: "In 30 days we will get you 10 closed bookings — completely done-with-you. We handle the offer, ads, sales process, and sales training so you can close deals on the phone.",
  keywords: "house cleaning Oviedo FL, best cleaning services Oviedo Florida, residential cleaning Oviedo, maid service Oviedo, deep cleaning Oviedo, professional cleaners Oviedo, home cleaning Winter Park, cleaning services Casselberry, move in cleaning Oviedo, move out cleaning Oviedo, weekly cleaning Oviedo, biweekly cleaning Oviedo",
  openGraph: {
    title: "10 Free Closed Bookings For Your Home Service Business",
    description: "In 30 days we will get you 10 closed bookings — completely done-with-you. We handle the offer, ads, sales process, and sales training so you can close deals on the phone.",
    type: "website",
    locale: "en_US",
    siteName: "Scaling Home Services",
    url: siteUrl,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Scaling Home Services - Professional House Cleaning Services Oviedo FL"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Seminole County House Cleaning | Deep & Standard Cleaning | Oviedo, Lake Mary, Winter Springs, Heathrow, Winter Park, Sanford, Geneva, Longwood, Casselberry",
    description: "Top-rated house cleaning services in Oviedo, Florida. Professional residential cleaning starting at $125. 5-star rated.",
    images: ["/og.png"]
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
    google: "your-google-verification-code", // You'll need to get this from Google Search Console
    yandex: "your-yandex-verification-code"
  },
  alternates: {
    canonical: siteUrl
  },
  icons: {
    icon: [
      { url: "/NewestFavicon.png", type: "image/png", sizes: "512x512" },
      { url: "/NewestFavicon.png", type: "image/png", sizes: "192x192" },
      { url: "/NewestFavicon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/NewestFavicon.png",
    apple: "/apple-touch-icon.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Early connections */}
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://stats.g.doubleclick.net" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
        {/* Preload LCP logo with responsive hints for faster discovery */}
        <link
          rel="preload"
          as="image"
          href={logoPath}
          imageSrcSet={`${logoPath} 128w, ${logoPath} 192w, ${logoPath} 256w, ${logoPath} 384w`}
          imageSizes="(max-width: 640px) 128px, 192px"
          fetchPriority="high"
        />
        {/* Minimal critical CSS to avoid render-blocking and speed first paint */}
        <style
          dangerouslySetInnerHTML={{ __html: `
            html,body{background:#FFFFFF;color:#000;}
            body{min-height:100vh;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
            header{contain:paint}
          `}}
        />
        {/* Preconnect to CDN/origin for faster image fetches */}
        <link rel="preconnect" href={siteUrl} />
        <link rel="dns-prefetch" href={siteUrl} />
      </head>
      <body className="bg-snow min-h-screen font-nhd">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {/* GA4 - load after interactive to avoid blocking main thread */}
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);} 
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
        <LocalSchema />
        <MetaPixel />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
