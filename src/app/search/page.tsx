import { SearchCourses } from "@/components/search-courses";

export default function SearchPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center justify-center space-y-8 px-5 py-8 md:min-h-[calc(100vh-64px)] md:px-8 md:py-0">
      <div className="flex flex-col gap-4 selection:bg-orange-500">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white md:text-5xl">
          Search CSUF Courses
        </h1>
        <p className="font-medium text-neutral-500 selection:text-black dark:selection:text-white md:text-base">
          Try out the search below. You can search using natural language like{" "}
          {"'how to create a website'"}. Available classes come from the{" "}
          <a
            className="text-orange-500 selection:text-sky-900 hover:underline dark:selection:text-sky-900"
            href="https://catalog.fullerton.edu/content.php?catoid=80&navoid=11056"
            target="_blank"
            rel="noreferrer"
          >
            2022-2023 CSUF Course Catalog &#8599;
          </a>
          .
        </p>
      </div>

      <SearchCourses />
    </main>
  );
}
