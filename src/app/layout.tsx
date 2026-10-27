import { Manrope, Orbitron, Libre_Caslon_Text } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';

import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import './globals.css';

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

const libreCaslon = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-caslon",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://soharth.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SOHARTH | Premium Heavyweight Oversized & Cultural T-Shirts",
    template: "%s | SOHARTH",
  },
  description:
    "Engineered 240+ GSM bio-washed combed cotton oversized t-shirts, ethnic fusion prints, and graphic streetwear. Free Express Shipping & Cash on Delivery across India.",
  keywords: [
    "oversized t-shirts",
    "240 GSM t-shirts",
    "heavyweight cotton tees",
    "bio-washed cotton t-shirts",
    "cultural streetwear india",
    "graphic tees india",
    "drop shoulder t-shirt",
    "luxury streetwear brand",
    "Soharth clothing",
    "men oversized t-shirt",
    "women oversized t-shirt",
    "aesthetic graphic tees",
    "cash on delivery streetwear"
  ],
  authors: [{ name: "SOHARTH Atelier", url: siteUrl }],
  creator: "SOHARTH",
  publisher: "SOHARTH",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SOHARTH | Premium Heavyweight Oversized & Cultural T-Shirts",
    description:
      "Engineered 240+ GSM bio-washed combed cotton oversized t-shirts, ethnic fusion prints, and graphic streetwear. Free Express Shipping & Cash on Delivery across India.",
    url: siteUrl,
    siteName: "SOHARTH",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/soharth-logo.jpg",
        width: 1200,
        height: 630,
        alt: "SOHARTH — Celestial Luxury Streetwear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SOHARTH | Premium Heavyweight Oversized & Cultural T-Shirts",
    description:
      "Engineered 240+ GSM bio-washed combed cotton oversized t-shirts & graphic streetwear across India.",
    images: ["/soharth-logo.jpg"],
    creator: "@soharth_in",
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
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.jpg",
  },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  "@id": `${siteUrl}/#organization`,
  "name": "SOHARTH",
  "url": siteUrl,
  "logo": `${siteUrl}/soharth-logo.jpg`,
  "image": `${siteUrl}/soharth-logo.jpg`,
  "description": "Engineered 240+ GSM bio-washed combed cotton oversized t-shirts, ethnic fusion prints, and graphic streetwear in India.",
  "sameAs": [
    "https://www.instagram.com/soharth.in/"
  ],
  "priceRange": "₹₹",
  "telephone": "+91-9137773967",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-9137773967",
    "contactType": "Customer Support",
    "areaServed": "IN",
    "availableLanguage": ["English", "Hindi"]
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN"
  }
};

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  "url": siteUrl,
  "name": "SOHARTH",
  "publisher": {
    "@id": `${siteUrl}/#organization`
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${siteUrl}/products?search={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    : 'https://ylqnpfalmtgeganpomkq.supabase.co';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
      </head>
      <body className={`${manrope.variable} ${orbitron.variable} ${libreCaslon.variable}`}>
        <ToastProvider>
          <CartProvider>
            {children}
            <MobileBottomNav />
          </CartProvider>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}