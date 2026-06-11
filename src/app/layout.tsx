import { Manrope } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';

import { CartProvider } from "@/context/CartContext";
import './globals.css';
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "SOHARTH | Celestial Minimalism",
  description:
    "Soharth bridges the gap between high-fashion editorial and cosmic wonder. Every piece is a quiet luxury, echoing the precision of astronomical phenomena.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={manrope.variable}>
          <CartProvider>
            {children}
          </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}