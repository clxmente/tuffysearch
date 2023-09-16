import "./globals.css";

import type { Metadata } from "next";

import { cn } from "@/lib/utils";

import { ThemeProvider } from "@/app/providers";

import { Inter } from "next/font/google";
import { TopNav } from "@/components/top-nav";

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
      <body className={cn(inter.className, "mx-auto max-w-[90rem]")}>
        <ThemeProvider attribute="class">
          <TopNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
