import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { PARTNER_REGISTRATION, RETAILER_NUMBER } from "@/data/retailerAuthorization";

/** Anchor for "Our Relationship with Peptides Company" on /about/authorized-retailer. */
export const PEPTIDES_COMPANY_SECTION_ID = "peptides-company";
export const PEPTIDES_COMPANY_HREF = `/about/authorized-retailer#${PEPTIDES_COMPANY_SECTION_ID}`;
/** Julia, 2026-11-12: her existing site ID (same as the retailer number). */
export const CONSULTANT_ID = RETAILER_NUMBER;
/** The ID is shown tied to Julia's name (Julia, 2026-11-12). */
export const CONSULTANT_NAME = PARTNER_REGISTRATION.name;

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
      <h2 id="peptides-company-heading" className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
        Our Relationship with Peptides Company
      </h2>
      <p className="mt-4 text-base leading-relaxed text-stone-700">
        Pure Fire Nutritional is independently operated by an Independent Consultant registered directly with Peptides
        Company. Our registration and affiliation can be independently verified by contacting Peptides Company.
      </p>

      <div className="mt-5 border border-stone-200 bg-white px-5 py-4 text-sm" data-testid="peptides-company-box">
        <p className="font-medium text-stone-900">Peptides Company — Registered Independent Consultant</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-stone-700">
            Consultant ID: <span className="font-semibold text-stone-900" data-testid="consultant-id">{CONSULTANT_ID}</span>
            <span className="text-stone-500"> · {CONSULTANT_NAME}</span>
          </p>
          <button
            type="button"
            onClick={onCopy}
            aria-label={copied ? "Consultant ID copied" : `Copy Consultant ID ${CONSULTANT_ID}`}
            className="inline-flex min-h-[28px] items-center gap-1 rounded border border-stone-300 px-2 py-0.5 text-[11px] text-stone-600 transition-colors hover:border-stone-900 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
            data-testid="copy-consultant-id"
          >
            {copied ? <Check className="h-3 w-3" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <span className="sr-only" role="status" aria-live="polite">{copied ? "Copied" : ""}</span>
        </div>
        <p className="mt-2 text-stone-600">
          <span className="font-medium text-stone-800">Verification:</span> Registration can be confirmed directly with
          Peptides Company.
        </p>
      </div>
    </section>
  );
}
