import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { TextLogo } from "@/components/icons/text-logo";
import { ModeToggle } from "@/components/theme-switcher";
import { GithubIcon } from "@/components/icons/github-logo";

export function TopNav() {
  return (
    <nav className="mx-auto flex h-16 max-w-[90rem] items-center justify-between p-6">
      <TextLogo />

      {/* Mobile Menu */}
      <MobileNav />

      {/* Desktop Menu */}
      <div className="hidden gap-2 md:flex">
        <Link
          href="/search"
          className="p-2 text-sm font-medium text-gray-900 hover:underline dark:text-gray-100"
        >
          Search Courses
        </Link>
        <Link
          href="/docs"
          className="p-2 text-sm font-medium text-gray-500 hover:underline dark:text-gray-400"
        >
          API Documentation
        </Link>
      </div>
      <div className="hidden items-center space-x-2 md:flex">
        <GithubIcon />
        <ModeToggle />
      </div>
    </nav>
  );
}
