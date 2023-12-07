"use client";

import * as z from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import {
  Form,
  FormItem,
  FormField,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { CourseSwitcher } from "@/components/course-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Search, ChevronLeft, ChevronRight, Copy } from "lucide-react";

function SkeletonLoader() {
  return (
    <div className="flex-col space-y-4">
      <Button variant="secondary" disabled>
        Show All Results
      </Button>
      <Card className="h-[194px] w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <Skeleton className="h-6 w-1/2 rounded-none" />
            <Button variant="outline" size="icon" disabled>
              <Copy className="h-5 w-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <Skeleton className="h-5 w-full rounded-none" />
          <Skeleton className="h-5 w-5/6 rounded-none" />
          <Skeleton className="h-5 w-2/3 rounded-none" />
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" disabled>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Prev Class
        </Button>
        <Button variant="outline" disabled>
          Next Class
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <p className="tetx-neutral-500 text-center text-sm dark:text-neutral-400">
        Showing 1/20 results
      </p>
    </div>
  );
}

const FormSchema = z.object({
  search_query: z.string().nonempty().max(1000),
});

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function SearchCourses() {
  const searchParams = useSearchParams();

  const searchQuery = searchParams?.get("q");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      search_query: searchQuery ?? "",
    },
  });

  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);

  // wrap onSubmit in a useCallback so that we can use it in useEffect
  const onSubmit = useCallback(
    async (formData: z.infer<typeof FormSchema>) => {
      setLoading(true);
      const response = await fetch("/api/search", {
        method: "POST",
        body: JSON.stringify({ search_query: formData.search_query }),
      });

      const data = await response.json();

      // @ts-ignore
      window.umami.track("Search");

      if (!data.success) {
        toast({
          title: data.error?.code ?? "Error",
          description: data.error?.message ?? "Something went wrong.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setMatches(data.data.matches);
      setLoading(false);
    },
    [toast],
  );

  // if searchQuery is not null, then we should submit the form
  useEffect(() => {
    if (searchQuery) {
      form.handleSubmit(onSubmit)();
    }
  }, [searchQuery, form, onSubmit]);

  return (
    <div className="flex w-full flex-col gap-4">
      <Form {...form}>
        <form
          className="flex items-center space-x-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="search_query"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="relative flex h-12 w-full items-center">
                    <Search className="absolute h-6 w-auto pl-3 text-neutral-200 dark:text-neutral-800" />
                    <Input
                      placeholder="creation of natural landmarks"
                      className="pl-11"
                      id="search_query"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="bg-orange-500 text-white hover:bg-orange-500/80 dark:bg-orange-500 dark:text-white dark:hover:bg-orange-500/80"
          >
            Search
          </Button>
        </form>
      </Form>

      {loading && <SkeletonLoader />}
      {!loading && matches.length > 0 && <CourseSwitcher matches={matches} />}
    </div>
  );
}
