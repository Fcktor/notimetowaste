import type { Metadata } from "next";
import { Newsreader, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { DaniWidget } from "@/components/DaniWidget";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "No Time To Waste — Relojes",
  description: "Relojes premium a pedido. Encuentra el reloj que define tu estilo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${newsreader.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ fontFamily: "var(--font-geist-sans, sans-serif)" }}>
        <Providers>{children}</Providers>
        <DaniWidget />
      </body>
    </html>
  );
}
