import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { RETAILER_NUMBER } from "@/data/retailerAuthorization";

/** Anchor for "Our Relationship with Peptides Company" on /about/authorized-retailer. */
export const PEPTIDES_COMPANY_SECTION_ID = "peptides-company";
export const PEPTIDES_COMPANY_HREF = `/about/authorized-retailer#${PEPTIDES_COMPANY_SECTION_ID}`;
/** Julia, 2026-11-12: her existing site ID (same as the retailer number). */
export const CONSULTANT_ID = RETAILER_NUMBER;

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Scrolls to #peptides-company when the page opens with that hash. */
function useScrollToHash() {
  useEffect(() => {
    const go = () => {
      if (window.location.hash !== `#${PEPTIDES_COMPANY_SECTION_ID}`) return;
      requestAnimationFrame(() => document.getElementById(PEPTIDES_COMPANY_SECTION_ID)?.scrollIntoView());
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, []);
}

/**
 * "Our Relationship with Peptides Company" + verification box (Julia's wording,
 * verbatim, 2026-11-12). Shown only on /about/authorized-retailer; not repeated.
 */
export default function PeptidesCompanyVerification() {
  useScrollToHash();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = async () => {
    if (!(await copyText(CONSULTANT_ID))) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id={PEPTIDES_COMPANY_SECTION_ID}
      className="mt-14 scroll-mt-24"
      aria-labelledby="peptides-company-heading"
      data-testid="peptides-company"
    >
      <h2 id="peptides-company-heading" className="font-serif text-2xl md:text-3xl font-normal tracking-tight text-stone-900">
        Our Relationship with Peptides Company
      </h2>
      <p className="mt-4 text-base leading-relaxed text-stone-700">
        Pure Fire Nutritional is independently operated by an Independent Consultant registered directly with Peptides
        Company. Our registration and affiliation can be independently verified by contacting Peptides Company.
      </p>

      <div className="mt-6 border border-stone-200 bg-white px-6 py-6 md:px-8" data-testid="peptides-company-box">
        <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
          Peptides Company — Registered Independent Consultant
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-stone-900">
            <span className="text-sm text-stone-500">Consultant ID: </span>
            <span className="font-serif text-3xl tracking-wide" data-testid="consultant-id">{CONSULTANT_ID}</span>
          </p>
          <button
            type="button"
            onClick={onCopy}
            aria-label={copied ? "Consultant ID copied" : `Copy Consultant ID ${CONSULTANT_ID}`}
            className="inline-flex min-h-[36px] items-center gap-1.5 border border-stone-300 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-stone-700 transition-colors hover:border-stone-900 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
            data-testid="copy-consultant-id"
          >
            {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <span className="sr-only" role="status" aria-live="polite">{copied ? "Copied" : ""}</span>
        </div>
        <p className="mt-4 border-t border-stone-100 pt-4 text-sm text-stone-600">
          <span className="font-medium text-stone-800">Verification:</span> Registration can be confirmed directly with
          Peptides Company.
        </p>
      </div>
    </section>
  );
}
