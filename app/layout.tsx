import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-cal",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "HiddenGems | Authentic, Budget City Discovery for Students",
  description:
    "Discover affordable food spots, quiet study spaces, scenic viewpoints, and vintage thrift markets curated and verified by students & locals.",
  keywords: [
    "hidden gems",
    "mumbai cheap eats",
    "quiet study spots",
    "budget travel",
    "student hangouts",
    "viewpoints",
    "thrift markets",
  ],
  authors: [{ name: "HiddenGems Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jakarta.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
