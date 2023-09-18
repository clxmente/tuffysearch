"use client";

import { useEffect, Suspense } from "react";
import { load, trackPageview } from "fathom-client";
import { usePathname, useSearchParams } from "next/navigation";

function TrackPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // load fathom script on mount
  useEffect(() => {
    load("ABQCUKKB", {
      includedDomains: ["tuffysearch.com", "www.tuffysearch.com"],
      auto: false,
    });
  }, []);

  // record a pageview when route changes
  useEffect(() => {
    if (!pathname) return;

    trackPageview({
      url: pathname + searchParams?.toString(),
      referrer: document.referrer,
    });
  }, [pathname, searchParams]);

  return null;
}

export default function Fathom() {
  return (
    <Suspense fallback={null}>
      <TrackPageView />
    </Suspense>
  );
}
