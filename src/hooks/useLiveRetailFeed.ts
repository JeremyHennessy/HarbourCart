import { useEffect, useState } from "react";
import type { LiveRetailFeed } from "../domain/liveRetail";

const LIVE_DATA_URL =
  "https://raw.githubusercontent.com/JeremyHennessy/HarbourCart/data/retail-live/public/data/retail-live.json";

async function fetchFeed(url: string, signal: AbortSignal) {
  const response = await fetch(url, { cache: "no-store", signal });
  if (!response.ok) {
    throw new Error("Retail feed returned HTTP " + response.status + ".");
  }
  return response.json() as Promise<LiveRetailFeed>;
}

export function useLiveRetailFeed() {
  const [feed, setFeed] = useState<LiveRetailFeed>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    const stamp = String(Date.now());

    const isLocalDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    const remoteUrl = new URL(
      isLocalDev ? "data/retail-live.json" : LIVE_DATA_URL,
      window.location.href,
    );
    remoteUrl.searchParams.set("t", stamp);

    const packagedUrl = new URL("data/retail-live.json", window.location.href);
    packagedUrl.searchParams.set("t", stamp);

    fetchFeed(remoteUrl.toString(), controller.signal)
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
              : "Live retail feed unavailable.",
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
            "Live data branch unavailable; showing the packaged snapshot. Freshness rules still apply.",
          );
        } catch (fallbackReason: unknown) {
          if (controller.signal.aborted) return;
          setError(
            fallbackReason instanceof Error
              ? fallbackReason.message
              : "Live retail feed unavailable.",
          );
        }
      });

    return () => controller.abort();
  }, []);

  return { feed, error };
}
