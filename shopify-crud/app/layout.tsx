import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { DaniWidget } from "@/components/DaniWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reech Store",
  description: "Tienda de productos Reech",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <DaniWidget />
      </body>
    </html>
  );
}
