import { useEffect, useState } from "react";
import type { LiveRetailFeed } from "../domain/liveRetail";

export function useLiveRetailFeed() {
  const [feed, setFeed] = useState<LiveRetailFeed>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    const url = new URL("data/retail-live.json", window.location.href);
    url.searchParams.set("t", String(Date.now()));

    fetch(url.toString(), { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Retail feed returned HTTP " + response.status + ".");
        }
        return response.json() as Promise<LiveRetailFeed>;
      })
      .then((data) => {
        setFeed(data);
        setError(undefined);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          reason instanceof Error
            ? reason.message
            : "Live retail feed unavailable.",
        );
      });

    return () => controller.abort();
  }, []);

  return { feed, error };
}
