import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Uncooked — CAIE A-Level Math Practice",
  description: "Focused CAIE A-Level Mathematics past-paper practice by component.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-[#0A0A0A] text-[#FAFAFA]`}>
        {children}
      </body>
    </html>
  );
}
