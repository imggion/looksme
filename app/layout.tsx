import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Avely | Waitlist",
  description: "Join the waitlist for the new standard for your bio.",
  generator: "v0.app",
  openGraph: {
    title: "Avely | Waitlist",
    description: "Join the waitlist for the new standard for your bio.",
    images: [
      {
        url: "/og/og-img.png",
        width: 1779,
        height: 1114,
        alt: "Avely waitlist preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Avely | Waitlist",
    description: "Join the waitlist for the new standard for your bio.",
    images: ["/og/og-img.png"],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
