import { useCallback, useEffect, useMemo, useState } from "react";

export type PickupPreference =
  | "weekday-evening"
  | "saturday-morning"
  | "saturday-afternoon"
  | "sunday-morning"
  | "flexible";

export type RemoteDemandAggregate = {
  product_id: string;
  interested_households: number;
  median_maximum_price: number | string | null;
  updated_at: string | null;
};

export type DemandAggregateView = {
  product_id: string;
  interested_households: number;
  median_maximum_price?: number;
  updated_at: string | null;
};

export type PilotDemandSummary = {
  unique_households: number;
  active_intents: number;
  products_with_interest: number;
  pickup_preferences: Record<string, number>;
};

type SubmitDemandInput = {
  productId: string;
  joined: boolean;
  maximumPrice: number;
  pickupPreference?: PickupPreference;
};

const ENDPOINT =
  "https://ryctzudgyldtjphkzkff.supabase.co/functions/v1/pilot-demand";
const SESSION_KEY = "harbourcart-pilot-session-v1";
const PICKUP_KEY = "harbourcart-pilot-pickup-v1";

function getSessionId(): string {
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (
    existing &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      existing,
    )
  ) {
    return existing;
  }

  const created = crypto.randomUUID();
  window.localStorage.setItem(SESSION_KEY, created);
  return created;
}

function readPickupPreference(): PickupPreference {
  const value = window.localStorage.getItem(PICKUP_KEY);
  if (
    value === "weekday-evening" ||
    value === "saturday-morning" ||
    value === "saturday-afternoon" ||
    value === "sunday-morning" ||
    value === "flexible"
  ) {
    return value;
  }
  return "flexible";
}

export function usePilotDemand() {
  const [sessionId] = useState(() =>
    typeof window === "undefined" ? "" : getSessionId(),
  );
  const [aggregates, setAggregates] = useState<RemoteDemandAggregate[]>([]);
  const [summary, setSummary] = useState<PilotDemandSummary>({
    unique_households: 0,
    active_intents: 0,
    products_with_interest: 0,
    pickup_preferences: {},
  });
  const [pickupPreference, setPickupPreferenceState] =
    useState<PickupPreference>(() =>
      typeof window === "undefined" ? "flexible" : readPickupPreference(),
    );
  const [loading, setLoading] = useState(true);
  const [submittingProductId, setSubmittingProductId] = useState<string>();
  const [error, setError] = useState<string>();

  const aggregateByProduct = useMemo(
    () =>
      new Map<string, DemandAggregateView>(
        aggregates.map((aggregate) => [
          aggregate.product_id,
          {
            product_id: aggregate.product_id,
            interested_households:
              Number(aggregate.interested_households) || 0,
            median_maximum_price:
              aggregate.median_maximum_price == null
                ? undefined
                : Number(aggregate.median_maximum_price),
            updated_at: aggregate.updated_at,
          },
        ]),
      ),
    [aggregates],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(ENDPOINT, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Demand service returned HTTP " + response.status + ".");
      }
      const payload = (await response.json()) as {
        data?: RemoteDemandAggregate[];
        summary?: Partial<PilotDemandSummary>;
        error?: string;
      };
      if (!Array.isArray(payload.data)) {
        throw new Error(payload.error ?? "Demand service returned invalid data.");
      }
      setAggregates(payload.data);
      setSummary({
        unique_households: Number(payload.summary?.unique_households) || 0,
        active_intents: Number(payload.summary?.active_intents) || 0,
        products_with_interest:
          Number(payload.summary?.products_with_interest) || 0,
        pickup_preferences:
          payload.summary?.pickup_preferences &&
          typeof payload.summary.pickup_preferences === "object"
            ? Object.fromEntries(
                Object.entries(payload.summary.pickup_preferences).map(
                  ([key, value]) => [key, Number(value) || 0],
                ),
              )
            : {},
      });
      setError(undefined);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Shared demand service unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setPickupPreference = (value: PickupPreference) => {
    setPickupPreferenceState(value);
    window.localStorage.setItem(PICKUP_KEY, value);
  };

  const submit = useCallback(
    async (input: SubmitDemandInput) => {
      if (!sessionId) {
        throw new Error("Anonymous pilot session unavailable.");
      }

      setSubmittingProductId(input.productId);
      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            product_id: input.productId,
            joined: input.joined,
            maximum_price: input.maximumPrice,
            pickup_preference:
              input.pickupPreference ?? pickupPreference ?? "flexible",
          }),
        });

        const payload = (await response.json()) as {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            payload.error === "rate_limit"
              ? "Too many pilot updates from this browser. Try again later."
              : payload.error ?? "Demand update failed.",
          );
        }

        await refresh();
        return true;
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Demand update failed.",
        );
        return false;
      } finally {
        setSubmittingProductId(undefined);
      }
    },
    [pickupPreference, refresh, sessionId],
  );

  return {
    aggregateByProduct,
    summary,
    loading,
    submittingProductId,
    error,
    refresh,
    submit,
    pickupPreference,
    setPickupPreference,
  };
}
