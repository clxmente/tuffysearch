import Link from "next/link";

import { AnimateSearches } from "@/components/animate-searches";

import { Search } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-center justify-center space-y-8 px-5 pt-8 md:min-h-[calc(100vh-64px)] md:px-8 md:pt-0">
      <div className="flex max-w-4xl flex-col gap-4 selection:bg-orange-500">
        <h1 className="text-6xl font-bold text-neutral-800 dark:text-white md:text-center md:text-7xl">
          <span className="relative whitespace-nowrap text-orange-500 selection:text-sky-900">
            <svg
              aria-hidden="true"
              viewBox="0 0 418 42"
              className="absolute left-0 top-2/3 h-[0.58em] w-full fill-orange-300/70 dark:fill-orange-500/30"
              preserveAspectRatio="none"
            >
              <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
            </svg>
            <span className="relative inline-block bg-gradient-to-br from-orange-700 to-orange-300 bg-clip-text text-transparent dark:to-orange-200">
              Streamlined
            </span>
          </span>{" "}
          Course Exploration
        </h1>
        <p className="font-medium text-neutral-500 selection:text-black dark:selection:text-white md:text-center md:text-lg">
          Explore CSUF courses with ease! TuffySearch allows CSUF students to
          search the course catalog using natural language to find the perfect
          classes. An API for the course catalog is also available for
          developers to use. The documentation is available{" "}
          <Link href="/docs" className="text-orange-500 hover:underline">
            here
          </Link>
          .
        </p>
      </div>

      <div className="w-full max-w-3xl rounded-2xl bg-neutral-400/10 p-4 dark:bg-neutral-900">
        <div className="flex items-center justify-between rounded-2xl bg-neutral-500/10 px-5 py-3 dark:bg-neutral-800/50">
          <div className="flex items-center space-x-3 rounded-2xl">
            <Search className="h-6 w-6 text-neutral-600 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Search for courses..."
              className="bg-transparent text-lg text-neutral-600 outline-none placeholder:text-neutral-600 dark:text-neutral-500 dark:placeholder:text-neutral-500"
            />
          </div>
          <button className="rounded-xl bg-gradient-to-tl from-orange-500 to-orange-300 px-4 py-2 font-semibold text-white hover:scale-95">
            Let&apos;s Go!
          </button>
        </div>
      </div>
      <div className="text-center font-semibold text-neutral-400 selection:bg-orange-500 selection:text-black dark:text-neutral-600 dark:selection:text-white md:text-3xl">
        <AnimateSearches />
      </div>
    </main>
  );
}
