import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Check, ChevronDown, Loader2, ShoppingCart } from "lucide-react";
import type { PeppyProductSuggestion, ResearchSource } from "@shared/peppy/types";
import { isHiddenProduct } from "@shared/hidden-products";
import PreorderBadge from "@/components/PreorderBadge";
import { useCart } from "@/contexts/CartContext";
import { useStoreProduct } from "./ProductPreview";
import { firstSentence } from "@/lib/pepitaPreview";
import { cardPrice, cardSizeOptions, createCardAdder, purchaseState } from "@/lib/pepitaCart";
import type { CartSize } from "@/lib/productSize";
import { productPath } from "@/lib/seo";

const canHover = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

/**
 * Pepita product card (v10): thumbnail, name, one-line relevance, real store price, size
 * selector, Add to Cart (the shop's CartContext; no redirect), More Info → product page.
 * Details open inline: hover on desktop, tap the header/chevron anywhere (no hover reliance).
 */
export default function PepitaProductCard({
  suggestion,
  fallbackResearch = [],
}: {
  suggestion: PeppyProductSuggestion;
  /** Answer-level studies used when the product has none of its own. */
  fallbackResearch?: readonly ResearchSource[];
}) {
  const { product: p, why, tissue, protocol } = suggestion;
  const store = useStoreProduct(p.id);
  const { addToCart } = useCart();
  const adder = useMemo(() => createCardAdder(addToCart), [addToCart]);
  const panelId = useId();
  const selectId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLButtonElement>(null);
  const anchorTop = useRef<number | null>(null);
  const hoverOpened = useRef(false);

  const [open, setOpen] = useState(false);
  const options = store ? cardSizeOptions(store) : [];
  const [size, setSize] = useState<CartSize | undefined>(undefined);
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");
  const chosen: CartSize | undefined = size && options.some(o => o.size === size) ? size : options[0]?.size;

  // Keep the header where it was on screen when the panel opens or closes.
  const toggle = (next: boolean) => {
    anchorTop.current = headerRef.current?.getBoundingClientRect().top ?? null;
    setOpen(next);
  };
  useLayoutEffect(() => {
    if (anchorTop.current === null || !headerRef.current) return;
    const diff = headerRef.current.getBoundingClientRect().top - anchorTop.current;
    if (Math.abs(diff) > 1) window.scrollBy(0, diff);
    anchorTop.current = null;
  }, [open]);

  useEffect(() => {
    if (status !== "added") return;
    const t = setTimeout(() => setStatus("idle"), 2500);
    return () => clearTimeout(t);
  }, [status]);

  if (isHiddenProduct(p)) return null;
  const state = purchaseState(store);
  const buyable = state === "available" || state === "preorder";
  const price = store && chosen ? cardPrice(store, chosen) : undefined;
  const name = store?.name ?? p.name;
  const image = store?.image ?? p.image;
  const ingredients = (store?.ingredients?.length ? store.ingredients : p.ingredients).slice(0, 5);
  const directions = protocol?.replace(/^Manufacturer protocol:\s*/, "");
  const research = suggestion.research?.length
    ? suggestion.research
    : fallbackResearch
        .filter(s => new RegExp(`\\b${p.name.split(" ")[0]}\\b`, "i").test(`${s.title} ${s.finding ?? ""}`))
        .slice(0, 2)
        .map(s => ({ id: s.id, title: s.title, url: s.url ?? "", finding: s.finding }))
        .filter(s => s.url);

  const onAdd = async () => {
    if (!store || !chosen || status === "adding") return;
    setStatus("adding");
    const r = await adder(store, chosen);
    setStatus(r === "added" ? "added" : "idle");
  };

  return (
    <div
      ref={cardRef}
      className="rounded-xl border border-gray-200 bg-white transition-colors [@media(hover:hover)]:hover:border-orange-300"
      data-testid="pepita-product-card"
      data-product-id={p.id}
      onMouseEnter={() => {
        if (canHover() && !open) {
          hoverOpened.current = true;
          toggle(true);
        }
      }}
      onMouseLeave={() => {
        if (canHover() && hoverOpened.current) {
          hoverOpened.current = false;
          toggle(false);
        }
      }}
    >
      <button
        ref={headerRef}
        type="button"
        onClick={() => {
          hoverOpened.current = false;
          toggle(!open);
        }}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${name}: ${open ? "hide" : "show"} details`}
        data-testid="pepita-card-toggle"
        className="flex w-full min-h-[44px] items-center gap-3 rounded-t-xl p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
      >
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
          {image && <img src={image} alt="" width={48} height={48} className="h-full w-full object-contain p-0.5" loading="lazy" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-gray-900">{name}</span>
            <PreorderBadge productId={p.id} />
          </span>
          <span className="mt-0.5 text-xs leading-snug text-gray-600 line-clamp-3" data-testid="pepita-card-why">
            {firstSentence(why, 160)}
          </span>
        </span>
        <span className="-mr-1 flex h-11 w-11 flex-shrink-0 items-center justify-center" aria-hidden="true">
          <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      <div id={panelId} hidden={!open} className="border-t border-gray-100 px-3 py-2 text-xs text-gray-700" data-testid="pepita-card-details">
        <dl className="space-y-1.5">
          {tissue && (
            <div>
              <dt className="font-medium text-gray-900">Target tissue</dt>
              <dd>{tissue}</dd>
            </div>
          )}
          <div>
            <dt className="font-medium text-gray-900">Proposed mechanism</dt>
            <dd>{why}</dd>
          </div>
          {ingredients.length > 0 && (
            <div>
              <dt className="font-medium text-gray-900">Key ingredients</dt>
              <dd>{ingredients.join(", ")}</dd>
            </div>
          )}
          <div>
            <dt className="font-medium text-gray-900">Manufacturer directions</dt>
            <dd data-testid="pepita-card-directions">
              {directions ?? "Not verified yet; see the label on the product page."}
            </dd>
          </div>
          {suggestion.alternatives && suggestion.alternatives.length > 0 && (
            <div>
              <dt className="font-medium text-gray-900">Other course schedules (educational, not the label)</dt>
              <dd>
                <ul className="space-y-0.5" data-testid="pepita-card-alternatives">
                  {suggestion.alternatives.map(a => (
                    <li key={a.text}>
                      {a.text} <span className="text-gray-500">({a.kind})</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          {research.length > 0 && (
            <div>
              <dt className="font-medium text-gray-900">Related research</dt>
              <dd>
                <ul className="space-y-1">
                  {research.map(r => (
                    <li key={r.id}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="pepita-card-research"
                        className="inline-flex min-h-[44px] items-center font-medium text-orange-700 sm:min-h-0 sm:py-0.5 underline underline-offset-2"
                      >
                        {firstSentence(r.finding ?? r.title, 140)}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="space-y-2 border-t border-gray-100 p-2 sm:flex sm:items-center sm:gap-3 sm:space-y-0">
        <div className="flex items-center gap-3">
          {buyable && options.length > 1 && (
            <>
              <label htmlFor={selectId} className="sr-only">
                Size for {name}
              </label>
              <select
                id={selectId}
                value={chosen}
                onChange={e => setSize(e.target.value as CartSize)}
                data-testid="pepita-card-size"
                className="h-11 min-w-[44px] rounded-xl border border-gray-200 bg-white px-2 text-base text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:text-sm"
              >
                {options.map(o => (
                  <option key={o.variantId ?? o.size} value={o.size}>
                    {o.label.replace(/\s*capsules?$/i, " caps").replace(/\s*tablets?$/i, " tabs")}
                  </option>
                ))}
              </select>
            </>
          )}
          {typeof price === "number" && (
            <span className="text-base font-bold text-orange-600" data-testid="pepita-card-price">
              ${price.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:flex-1">
          {buyable ? (
            <button
              type="button"
              onClick={() => void onAdd()}
              disabled={status === "adding" || price === undefined}
              aria-label={`${state === "preorder" ? "Pre-order" : "Add"} ${name}${options.length > 1 ? `, ${options.find(o => o.size === chosen)?.label}` : ""} to cart`}
              data-testid="pepita-card-add"
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-900 px-2.5 text-sm font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-60 [@media(hover:hover)]:hover:bg-orange-600 sm:flex-none sm:min-w-[9rem]"
            >
              {status === "adding" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : status === "added" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              )}
              {status === "added" ? <span data-testid="pepita-card-added">Added to cart</span> : state === "preorder" ? "Pre-order" : "Add to Cart"}
            </button>
          ) : (
            <span className="inline-flex h-11 flex-1 items-center text-sm text-gray-500" data-testid="pepita-card-unavailable">
              {state === "out-of-stock" ? "Out of stock" : "Currently unavailable"}
            </span>
          )}
          <Link
            href={productPath(p.id)}
            data-testid="pepita-card-more"
            className="ml-auto inline-flex h-11 flex-shrink-0 items-center px-1 text-sm font-semibold text-orange-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            More Info<span className="sr-only"> about {name}</span>
          </Link>
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {status === "added" ? `${name} added to cart` : ""}
        </span>
      </div>
    </div>
  );
}
