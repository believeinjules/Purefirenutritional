import { useId, useState, type FormEvent } from "react";
import { Link, useParams } from "wouter";
import PageSeo from "@/components/seo/PageSeo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NotFound from "@/pages/NotFound";
import { requirePageHead } from "@/lib/seo/publicHeads";
import { productPath } from "@/lib/seo";
import {
  BATCH_PASSPORT_PATH,
  batchDisplayName,
  batchPath,
  batchProducts,
  expiryLabel,
  findBatches,
  getBatchByKey,
  madeLabel,
  normalizeLot,
  type Batch,
} from "@shared/batches";

const eyebrow = "text-[11px] uppercase tracking-[0.28em] text-stone-500";
const h2 = "text-[11px] uppercase tracking-[0.22em] text-stone-500";
const a = "underline underline-offset-2 hover:text-stone-900";
const SOURCED = "Sourced directly from the manufacturer";
const STANDARD_LINE = "Part of our Show Your Work standard.";

function PrintedNote({ printed }: { printed: string | null }) {
  if (!printed) return null;
  return <span className="block text-xs text-stone-500">Printed as {printed}</span>;
}

/** One batch's details, as printed on the package. Shared by the lookup result and the batch page. */
export function BatchCard({ batch, headingLevel = "h2" }: { batch: Batch; headingLevel?: "h2" | "h3" }) {
  const made = madeLabel(batch);
  const expiry = expiryLabel(batch);
  const Heading = headingLevel;
  return (
    <article className="rounded-sm border border-stone-300 bg-white/70 p-5 sm:p-6" data-testid="batch-card">
      <Heading className="font-serif text-2xl font-normal text-stone-900 break-words">
        {batchDisplayName(batch)}
      </Heading>
      <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 text-base text-stone-700 sm:grid-cols-2">
        <div>
          <dt className={h2}>Size</dt>
          <dd className="mt-1 break-words">{batch.size}</dd>
        </div>
        <div>
          <dt className={h2}>Lot</dt>
          <dd className="mt-1 font-mono break-all" data-testid="batch-lot">{batch.lot}</dd>
        </div>
        <div>
          <dt className={h2}>Made</dt>
          <dd className="mt-1" data-testid="batch-made">
            {made.display}
            <PrintedNote printed={made.printed} />
          </dd>
        </div>
        <div>
          <dt className={h2}>Expires</dt>
          <dd className="mt-1" data-testid="batch-expiry">
            {expiry.display}
            <PrintedNote printed={expiry.printed} />
            {!batch.expiryPrinted && batch.shelfLife && (
              <span className="block text-xs text-stone-500">No dated best-before is printed on this package.</span>
            )}
          </dd>
        </div>
      </dl>
      <p className="mt-5 border-t border-stone-200 pt-4 text-sm text-stone-700">{SOURCED}.</p>
      {batch.catalogProductId && (
        <p className="mt-3 text-sm text-stone-700">
          <Link href={productPath(batch.catalogProductId)} className={a} data-testid="batch-pdp-link">
            View {batch.productName}
          </Link>
        </p>
      )}
    </article>
  );
}

function WhereToFind() {
  return (
    <section className="mt-12" aria-labelledby="batch-where">
      <h2 id="batch-where" className={h2}>Where to find your lot number</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-stone-700">
        <li>Boxed capsules: the stamp on the box flap or end panel. The lot is the number marked “Series” or “Batch”, next to the production and best-before dates.</li>
        <li>Prime Peptide bottles: printed on the bottom of the bottle.</li>
        <li>Mesotel bottles: the stamp on the bottle label.</li>
      </ul>
    </section>
  );
}

type Result =
  | { kind: "idle" }
  | { kind: "match"; batch: Batch }
  | { kind: "choose"; lot: string; batches: Batch[] }
  | { kind: "notFound"; lot: string; productName: string | null };

export function BatchPassportLookup() {
  const head = requirePageHead(BATCH_PASSPORT_PATH);
  const options = batchProducts();
  const productId = useId();
  const lotId = useId();
  const lotHintId = useId();
  const [product, setProduct] = useState("");
  const [lot, setLot] = useState("");
  const [result, setResult] = useState<Result>({ kind: "idle" });
  const [lotError, setLotError] = useState(false);

  function lookUp(productSlug: string, lotInput: string) {
    const normalized = normalizeLot(lotInput);
    if (!normalized) {
      setLotError(true);
      setResult({ kind: "idle" });
      return;
    }
    setLotError(false);
    const matches = findBatches(normalized, productSlug || null);
    if (matches.length === 1) setResult({ kind: "match", batch: matches[0] });
    else if (matches.length > 1) setResult({ kind: "choose", lot: normalized, batches: matches });
    else
      setResult({
        kind: "notFound",
        lot: normalized,
        productName: options.find((o) => o.productSlug === productSlug)?.productName ?? null,
      });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    lookUp(product, lot);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f3ee] text-stone-900">
      <PageSeo title={head.title} description={head.description} path={BATCH_PASSPORT_PATH} type="website" />
      <Navigation />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-24" data-testid="batch-passport-page">
          <p className={eyebrow}>Batch Passport</p>
          <h1 className="mt-4 font-serif text-5xl font-normal tracking-tight text-stone-900">Look up your batch</h1>
          <p className="mt-6 text-base md:text-lg leading-relaxed text-stone-600">
            Type the lot number from your box to see when that batch was made and when it expires, as printed on the package.
          </p>
          <p className="mt-3 text-sm text-stone-500">{STANDARD_LINE}</p>

          <form className="mt-10 space-y-6" onSubmit={onSubmit} noValidate aria-label="Batch lookup">
            <div>
              <label htmlFor={productId} className={h2}>
                Product <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <select
                id={productId}
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="mt-2 block w-full rounded-sm border border-stone-300 bg-white px-3 py-3 text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500"
                data-testid="batch-product"
              >
                <option value="">Not sure / detect from lot</option>
                {options.map((o) => (
                  <option key={o.productSlug} value={o.productSlug}>
                    {o.productName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={lotId} className={h2}>
                Lot number
              </label>
              <input
                id={lotId}
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                aria-describedby={lotHintId}
                aria-invalid={lotError || undefined}
                placeholder="e.g. 20126"
                className="mt-2 block w-full rounded-sm border border-stone-300 bg-white px-3 py-3 font-mono text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500"
                data-testid="batch-lot-input"
              />
              <p id={lotHintId} className="mt-2 text-sm text-stone-500">
                {lotError ? "Please enter the lot number from your box." : "Spaces and capital letters don't matter."}
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-sm bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.18em] text-white hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
              data-testid="batch-submit"
            >
              Look up
            </button>
          </form>

          <div className="mt-10" aria-live="polite" aria-atomic="true" data-testid="batch-result">
            {result.kind === "match" && <BatchCard batch={result.batch} />}
            {result.kind === "choose" && (
              <div className="rounded-sm border border-stone-300 bg-white/70 p-5 sm:p-6">
                <p className="text-base text-stone-700">
                  Lot <span className="font-mono">{result.lot}</span> is printed on more than one product. Which one do you have?
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {result.batches.map((b) => (
                    <li key={b.productSlug}>
                      <button
                        type="button"
                        onClick={() => {
                          setProduct(b.productSlug);
                          lookUp(b.productSlug, result.lot);
                        }}
                        className="rounded-sm border border-stone-400 px-4 py-2 text-sm text-stone-800 hover:bg-stone-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-stone-500"
                      >
                        {b.productName}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.kind === "notFound" && (
              <div className="rounded-sm border border-stone-300 bg-white/70 p-5 sm:p-6" data-testid="batch-not-found">
                <p className="text-base text-stone-700">
                  We couldn't find lot <span className="font-mono break-all">{result.lot}</span>
                  {result.productName ? ` for ${result.productName}` : ""}. We may not have added this batch yet.
                </p>
                <p className="mt-3 text-base text-stone-700">
                  Please check the number on your box, or{" "}
                  <Link href="/contact" className={a}>
                    contact us
                  </Link>{" "}
                  and we'll look it up for you.
                </p>
              </div>
            )}
          </div>

          <WhereToFind />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function BatchPassportDetail() {
  const { key } = useParams<{ key: string }>();
  const batch = key ? getBatchByKey(key) : undefined;
  if (!batch) return <NotFound />;
  const made = madeLabel(batch);
  const expiry = expiryLabel(batch);
  const title = `${batch.productName} Lot ${batch.lot} | Batch Passport`;
  const expiryText = batch.expiryPrinted ? `expires ${expiry.display}` : expiry.display.toLowerCase();
  const madeText = batch.madePrinted ? `made ${made.display}` : "made date not printed";
  const description = `${batchDisplayName(batch)}, ${batch.size}, lot ${batch.lot}: ${madeText}, ${expiryText}, as printed on the package. ${SOURCED}.`;

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f3ee] text-stone-900">
      <PageSeo title={title} description={description} path={batchPath(batch)} noindex type="website" />
      <Navigation />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-24" data-testid="batch-detail-page">
          <p className={eyebrow}>Batch Passport</p>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-normal tracking-tight text-stone-900 break-words">
            {batch.productName}, lot {batch.lot}
          </h1>
          <p className="mt-6 text-base md:text-lg leading-relaxed text-stone-600">
            The details below are copied from the package for this batch.
          </p>
          <p className="mt-3 text-sm text-stone-500">{STANDARD_LINE}</p>
          <div className="mt-10">
            <BatchCard batch={batch} />
          </div>
          <p className="mt-8 text-base text-stone-700">
            <Link href={BATCH_PASSPORT_PATH} className={a}>
              Look up another batch
            </Link>
          </p>
          <WhereToFind />
        </div>
      </main>
      <Footer />
    </div>
  );
}
