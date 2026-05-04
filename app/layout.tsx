import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import { hasRealClerkPublishableKey } from "@/lib/clerk-config";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HeatMap OS",
  description: "Local SEO heatmap dashboard foundation built with Next.js, TypeScript, App Router, Tailwind CSS, Framer Motion, and lucide-react.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const document = (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );

  if (!hasRealClerkPublishableKey()) {
    return document;
  }

  return (
    <ClerkProvider>
      {document}
    </ClerkProvider>
  );
}
