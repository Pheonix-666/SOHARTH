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

export const metadata: Metadata = {
  title: "SOHARTH | Premium Heavyweight Oversized & Cultural T-Shirts",
  description:
    "Engineered 240+ GSM bio-washed combed cotton oversized t-shirts, ethnic fusion prints, and graphic streetwear. Free Express Shipping & Cash on Delivery across India.",
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