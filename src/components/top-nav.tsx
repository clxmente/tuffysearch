import Link from "next/link";

import { TextLogo } from "@/components/icons/text-logo";
import { ModeToggle } from "@/components/theme-switcher";
import { GithubIcon } from "@/components/icons/github-logo";

export function TopNav() {
  return (
    <nav className="mx-auto flex h-16 max-w-[90rem] items-center justify-between p-6">
      <TextLogo />
      <Link
        href="/docs"
        className="p-2 text-sm font-semibold text-gray-700 hover:underline dark:text-gray-100"
      >
        API Documentation
      </Link>
      <div className="flex items-center space-x-2">
        <GithubIcon />
        <ModeToggle />
      </div>
    </nav>
  );
}
