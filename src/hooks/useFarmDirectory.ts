import { useEffect, useState } from "react";
import type { FarmDirectoryFeed } from "../domain/farmDirectory";

const LIVE_DATA_URL =
  "https://raw.githubusercontent.com/JeremyHennessy/HarbourCart/data/farm-directory/public/data/farm-directory.json";

async function fetchFeed(url: string, signal: AbortSignal) {
  const response = await fetch(url, { cache: "no-store", signal });
  if (!response.ok) {
    throw new Error("Farm directory feed returned HTTP " + response.status + ".");
  }
  return response.json() as Promise<FarmDirectoryFeed>;
}

export function useFarmDirectory() {
  const [feed, setFeed] = useState<FarmDirectoryFeed>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    const stamp = String(Date.now());

    const isLocalDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    const liveUrl = new URL(
      isLocalDev ? "data/farm-directory.json" : LIVE_DATA_URL,
      window.location.href,
    );
    liveUrl.searchParams.set("t", stamp);

    const packagedUrl = new URL(
      "data/farm-directory.json",
      window.location.href,
    );
    packagedUrl.searchParams.set("t", stamp);

    fetchFeed(liveUrl.toString(), controller.signal)
      .then((data) => {
        setFeed(data);
        setError(undefined);
      })
      .catch(async (reason: unknown) => {
        if (controller.signal.aborted) return;

        if (isLocalDev) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Farm directory unavailable.",
          );
          return;
        }

        try {
          const fallback = await fetchFeed(
            packagedUrl.toString(),
            controller.signal,
          );
          setFeed(fallback);
          setError(
            "Live farm-data branch unavailable; showing the packaged discovery snapshot.",
          );
        } catch (fallbackReason: unknown) {
          if (controller.signal.aborted) return;
          setError(
            fallbackReason instanceof Error
              ? fallbackReason.message
              : "Farm directory unavailable.",
          );
        }
      });

    return () => controller.abort();
  }, []);

  return { feed, error };
}
