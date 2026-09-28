import { useMemo, useState } from "react";
import { pilotCandidates } from "../data/pilot";
import { supplierTargets } from "../data/suppliers";
import {
  offerUnitPrice,
  validateSupplierOffer,
  type SupplierOffer,
} from "../domain/offers";

const money = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

type Props = {
  offers: SupplierOffer[];
  addOffer: (offer: SupplierOffer) => void;
  removeOffer: (id: string) => void;
  replaceOffers: (offers: SupplierOffer[]) => void;
};

const today = () => new Date().toISOString().slice(0, 10);

export default function SupplierQuoteWorkspace({
  offers,
  addOffer,
  removeOffer,
  replaceOffers,
}: Props) {
  const firstProduct = pilotCandidates[0];
  const [supplierId, setSupplierId] = useState(supplierTargets[0]?.id ?? "");
  const [productId, setProductId] = useState(firstProduct?.id ?? "");
  const [description, setDescription] = useState(firstProduct?.product ?? "");
  const [casePrice, setCasePrice] = useState("");
  const [caseQuantity, setCaseQuantity] = useState("");
  const [unit, setUnit] = useState(firstProduct?.unit ?? "kg");
  const [minimumOrderCases, setMinimumOrderCases] = useState("1");
  const [deliveryCost, setDeliveryCost] = useState("0");
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [observedAt, setObservedAt] = useState(today());
  const [validUntil, setValidUntil] = useState("");
  const [sourceReference, setSourceReference] = useState("");
  const [message, setMessage] = useState<string>();

  const supplierById = useMemo(
    () => new Map(supplierTargets.map((supplier) => [supplier.id, supplier])),
    [],
  );

  const productById = useMemo(
    () => new Map(pilotCandidates.map((product) => [product.id, product])),
    [],
  );

  const chooseProduct = (id: string) => {
    setProductId(id);
    const product = productById.get(id);
    if (product) {
      setDescription(product.product);
      setUnit(product.unit);
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const offer: SupplierOffer = {
      id: `local-${supplierId}-${productId}-${Date.now()}`,
      supplierId,
      productId,
      productDescription: description.trim(),
      casePrice: Number(casePrice),
      caseQuantity: Number(caseQuantity),
      unit,
      minimumOrderCases: Number(minimumOrderCases),
      observedAt,
      validUntil: validUntil || undefined,
      deliveryCost: Number(deliveryCost) || 0,
      pickupAvailable,
      evidence: "VERIFIED_QUOTE",
      sourceReference: sourceReference.trim(),
    };

    const validation = validateSupplierOffer(offer, today());
    if (!validation.valid) {
      setMessage(validation.reasons.join(" "));
      return;
    }

    addOffer(offer);
    setMessage("Verified quote saved in this browser only.");
    setCasePrice("");
    setCaseQuantity("");
    setValidUntil("");
    setSourceReference("");
  };

  const exportOffers = () => {
    const blob = new Blob([JSON.stringify(offers, null, 2) + "\n"], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `harbourcart-supplier-quotes-${today()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importOffers = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as SupplierOffer[];
      if (!Array.isArray(parsed)) throw new Error("Expected a JSON array.");
      const invalid = parsed.flatMap((offer) => {
        const validation = validateSupplierOffer(offer, today());
        return validation.valid
          ? []
          : [`${offer?.productId ?? "unknown"}: ${validation.reasons.join(" ")}`];
      });
      if (invalid.length) {
        setMessage("Import rejected: " + invalid.join(" | "));
        return;
      }
      replaceOffers(parsed);
      setMessage(`Imported ${parsed.length} verified quote(s).`);
    } catch (error) {
      setMessage(
        error instanceof Error ? "Import failed: " + error.message : "Import failed.",
      );
    }
  };

  return (
    <section className="quote-workspace" aria-label="Supplier quote workspace">
      <div className="quote-workspace__heading">
        <div>
          <span className="eyebrow">Private browser workspace</span>
          <h3>Supplier quotes</h3>
        </div>
        <span className="status-chip">
          {offers.length} verified quote{offers.length === 1 ? "" : "s"}
        </span>
      </div>

      <p className="muted">
        Enter only a quote you actually received and can trace to retained evidence.
        This prototype stores quotes in this browser; it does not upload them or
        make them public.
      </p>

      <form className="quote-form" onSubmit={submit}>
        <label>
          Supplier
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            {supplierTargets.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Product
          <select value={productId} onChange={(e) => chooseProduct(e.target.value)}>
            {pilotCandidates.map((product) => (
              <option key={product.id} value={product.id}>
                {product.product}
              </option>
            ))}
          </select>
        </label>

        <label className="quote-form__wide">
          Exact quoted description / grade / variety
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>

        <label>
          Case price
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={casePrice}
            onChange={(e) => setCasePrice(e.target.value)}
            required
          />
        </label>

        <label>
          Case quantity
          <input
            type="number"
            min="0.001"
            step="0.001"
            value={caseQuantity}
            onChange={(e) => setCaseQuantity(e.target.value)}
            required
          />
        </label>

        <label>
          Unit
          <select\n            value={unit}\n            onChange={(e) => setUnit(e.target.value as "kg" | "ea")}\n          >
            <option value="kg">kg</option>
            <option value="ea">each</option>
          </select>
        </label>

        <label>
          MOQ · cases
          <input
            type="number"
            min="1"
            step="1"
            value={minimumOrderCases}
            onChange={(e) => setMinimumOrderCases(e.target.value)}
            required
          />
        </label>

        <label>
          Delivery charge
          <input
            type="number"
            min="0"
            step="0.01"
            value={deliveryCost}
            onChange={(e) => setDeliveryCost(e.target.value)}
          />
        </label>

        <label>
          Quote date
          <input
            type="date"
            value={observedAt}
            onChange={(e) => setObservedAt(e.target.value)}
            required
          />
        </label>

        <label>
          Valid until
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            required
          />
        </label>

        <label className="quote-form__wide">
          Evidence reference
          <input
            placeholder="e.g. CTL email 2026-09-29 or quote PDF Q-1042"
            value={sourceReference}
            onChange={(e) => setSourceReference(e.target.value)}
            required
          />
        </label>

        <label className="quote-checkbox">
          <input
            type="checkbox"
            checked={pickupAvailable}
            onChange={(e) => setPickupAvailable(e.target.checked)}
          />
          Supplier pickup is available
        </label>

        <button className="button" type="submit">
          Save verified quote
        </button>
      </form>

      {message && <p className="quote-message">{message}</p>}

      <div className="quote-tools">
        <button
          type="button"
          className="button button--secondary"
          onClick={exportOffers}
          disabled={!offers.length}
        >
          Export quote JSON
        </button>
        <label className="quote-import">
          Import verified quote JSON
          <input
            type="file"
            accept=".json,application/json"
            onChange={(event) => void importOffers(event.target.files?.[0])}
          />
        </label>
      </div>

      {offers.length > 0 && (
        <div className="quote-list">
          {offers.map((offer) => {
            const supplier = supplierById.get(offer.supplierId);
            return (
              <article key={offer.id} className="quote-row">
                <div>
                  <strong>{offer.productDescription}</strong>
                  <span>
                    {supplier?.name ?? offer.supplierId} · {money.format(offer.casePrice)}
                    /{offer.caseQuantity} {offer.unit} · MOQ {offer.minimumOrderCases}
                  </span>
                  <small>
                    {money.format(offerUnitPrice(offer))}/{offer.unit} · valid through{" "}
                    {offer.validUntil} · evidence: {offer.sourceReference}
                  </small>
                </div>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => removeOffer(offer.id)}
                >
                  Remove
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
