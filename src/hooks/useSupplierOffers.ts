import { useState } from "react";
import type { SupplierOffer } from "../domain/offers";

const STORAGE_KEY = "harbourcart-supplier-offers-v1";

function loadOffers(): SupplierOffer[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as SupplierOffer[]) : [];
  } catch {
    return [];
  }
}

export function useSupplierOffers() {
  const [offers, setOffers] = useState<SupplierOffer[]>(loadOffers);

  const persist = (next: SupplierOffer[]) => {
    setOffers(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return {
    offers,
    addOffer(offer: SupplierOffer) {
      persist([offer, ...offers.filter((item) => item.id !== offer.id)]);
    },
    removeOffer(id: string) {
      persist(offers.filter((offer) => offer.id !== id));
    },
    replaceOffers(next: SupplierOffer[]) {
      persist(next);
    },
  };
}
