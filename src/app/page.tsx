import Image from "next/image";

import { AnimateSearches } from "@/components/animate-searches";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl flex-col items-center justify-center space-y-8 p-24">
      <h1 className="text-center text-7xl font-bold text-neutral-800 dark:text-white">
        <span className="dark:text-orange-500">Simplify</span> Course
        Exploration
      </h1>

      <div className="text-center text-3xl font-semibold dark:text-neutral-600">
        <AnimateSearches />
      </div>

      <div className="w-full rounded-lg bg-neutral-900/10 p-3 dark:bg-neutral-900">
        <div className="flex items-center justify-between rounded-lg bg-neutral-800/50 p-2">
          <div className="flex items-center space-x-4 rounded-lg ">
            <MagnifyingGlassIcon className="h-6 w-6 text-neutral-800 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Search for courses..."
              className="text-neutral-500 outline-none placeholder:text-neutral-500 dark:bg-transparent"
            />
          </div>
          <button className="rounded-lg px-4 py-2 font-semibold dark:bg-orange-500 dark:hover:bg-orange-500/80">
            Let&apos;s Go!
          </button>
        </div>
      </div>
    </main>
  );
}
