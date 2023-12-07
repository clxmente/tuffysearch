"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, SendHorizontal } from "lucide-react";

export function HomeSearch() {
  const router = useRouter();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { elements } = e.currentTarget;

    const search_query = (
      elements.namedItem("index_search") as HTMLInputElement
    ).value;

    if (!search_query) return;

    // @ts-ignore
    window.umami.track("Home Search");

    router.push(`/search?q=${encodeURIComponent(search_query)}`);
  }

  return (
    <div className="w-full max-w-3xl rounded-2xl bg-neutral-400/10 p-4 dark:bg-neutral-900/40">
      <form
        onSubmit={handleSubmit}
        className="flex items-center space-x-4 rounded-2xl bg-neutral-500/10 px-5 py-2 dark:bg-neutral-900/50"
      >
        <div className="flex w-full items-center space-x-3 rounded-2xl">
          <Search className="h-6 w-6 text-neutral-600 dark:text-neutral-500" />
          <input
            type="text"
            placeholder="Search for courses..."
            className="w-full bg-transparent text-lg outline-none placeholder:text-neutral-600 dark:placeholder:text-neutral-500"
            name="index_search"
            id="index_search"
          />
        </div>
        <button
          type="submit"
          className="hidden rounded-xl bg-gradient-to-tl from-orange-500 to-orange-300 px-4 py-2 font-semibold text-white hover:scale-95 sm:flex"
        >
          <SendHorizontal className="h-6 w-6" />
        </button>
      </form>
    </div>
  );
}
