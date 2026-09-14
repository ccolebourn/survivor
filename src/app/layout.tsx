import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CURRENT_SEASON } from "@/lib/constants";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `Survivor ${CURRENT_SEASON} Draft`,
  description: `Fantasy draft game for Survivor Season ${CURRENT_SEASON}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased bg-gray-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
