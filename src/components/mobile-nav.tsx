"use client";

import Link from "next/link";

import { useState } from "react";

import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { Menu, Search, Database, Github, Home } from "lucide-react";
import { TextLogo } from "@/components/icons/text-logo";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex justify-end md:hidden">
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader className="mt-4">
            <div className="flex justify-center">
              <TextLogo />
            </div>
          </SheetHeader>
          <div className="mt-4 space-y-6">
            <h3 className="font-semibold">Navigation</h3>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="h-14 w-full justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  <span className="text-center">Home</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-14 w-full justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/search">
                  <Search className="mr-2 h-5 w-5" />
                  <span className="text-center">Search Courses</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-14 w-full justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/docs">
                  <Database className="mr-2 h-5 w-5" />
                  <span className="text-center">API Documentation</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-14 w-full justify-start"
                asChild
                onClick={() => {
                  setOpen(false);
                  // @ts-ignore
                  window.umami.track("View Github");
                }}
              >
                <a
                  href="https://github.com/clxmente/tuffysearch"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="mr-2 h-5 w-5" />
                  <span className="text-center">Source Code</span>
                </a>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
