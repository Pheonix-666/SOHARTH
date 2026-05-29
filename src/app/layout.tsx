import type { Metadata } from "next";
import { Libre_Caslon_Text, Manrope } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const libreCaslon = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caslon",
  style: ["normal", "italic"],
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "SOLARTH | Celestial Minimalism",
  description: "Solarth bridges the gap between high-fashion editorial and cosmic wonder. Every piece is a quiet luxury, echoing the precision of astronomical phenomena.",
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
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
      </head>
      <body className={`${libreCaslon.variable} ${manrope.variable}`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
