import "@/app/globals.css";

import type { AppProps } from "next/app";

import * as Fathom from "fathom-client";

import { useEffect } from "react";
import { useRouter } from "next/router";

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    Fathom.load("ABQCUKKB", {
      includedDomains: ["tuffysearch.com", "www.tuffysearch.com"],
    });

    function onRouteChangeComplete() {
      Fathom.trackPageview();
    }
    // Record a pageview when route changes
    router.events.on("routeChangeComplete", onRouteChangeComplete);

    // Unassign event listener
    return () => {
      router.events.off("routeChangeComplete", onRouteChangeComplete);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}

export default App;
