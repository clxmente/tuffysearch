import "./globals.css";

import type { Metadata } from "next";

import Script from "next/script";

import { cn } from "@/lib/utils";

import { TopNav } from "@/components/top-nav";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TuffySearch",
  description:
    "Explore CSUF courses with ease! TuffySearch allows CSUF students to search the course catalog using natural language to find the perfect class.",
  keywords:
    "CSUF, TuffySearch, Course Catalog, Search, CSUF Search, Classes, CSU Fullerton",
  openGraph: {
    type: "website",
    title: "TuffySearch",
    description:
      "Explore CSUF courses with ease! TuffySearch allows CSUF students to search the course catalog using natural language to find the perfect class.",
    url: "https://tuffysearch.com",
    images: [
      {
        url: "https://tuffysearch.com/tuffysearch.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@clxmente",
    creator: "@clxmente",
    images: "https://tuffysearch.com/tuffysearch.png",
  },
  creator: "Clemente Solorio",
  applicationName: "TuffySearch",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        async
        src="https://umami.lebron.cloud/script.js"
        data-website-id="b6284fc3-05fa-48f9-9847-4a8f5f2ad40c"
      />
      <body className={cn(inter.className, "bg-white dark:bg-neutral-950")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TopNav />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
