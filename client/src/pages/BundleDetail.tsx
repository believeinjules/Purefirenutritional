import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageSeo from "@/components/seo/PageSeo";
import { bundleHead } from "@/lib/seo/bundle";
import NotFound from "@/pages/NotFound";
import { getProductById } from "@/data/products";
import { fetchProductById } from "@/lib/productsStorage";
import { responsiveImage } from "@/lib/responsiveImage";
import { getPdpContent } from "@shared/product-facts";
import { formatUSD, formatUSDCents } from "@shared/format-price";
import {
  BUNDLE_MANUFACTURER_NOTE,
  BUNDLE_NOT_STUDIED_NOTE,
  PRIME_PRODUCT_NAMES,
  BUNDLE_LIFESTYLE_SIZE,
  boughtSeparatelyCents,
  bottleAlt,
  bundleLifestyleImage,
  bundleSubtitle,
  getMixedBundle,
  groupBottlesAlt,
  type MixedBundle,
} from "@shared/mixed-bundles";

/**
 * Draft bundles (live: false) render only in a preview build
 * (VITE_BUNDLE_PREVIEW=1); production shows NotFound until a bundle goes live.
 */
export function canShowBundle(bundle: MixedBundle | undefined, previewFlag: unknown): boolean {
  if (!bundle) return false;
  return bundle.live || previewFlag === "1" || previewFlag === "true";
}

/** The frozen Prime product-page safety text (identical on all five Prime pages). */
export function bundleSafetyText(bundle: MixedBundle): string | undefined {
  return getPdpContent(bundle.productIds[0])?.safety;
}

function useSinglePrices(ids: string[]): Record<string, number | undefined> {
  // Start from the code catalog (also what SSR renders), then refresh from the
  // live catalog the cart and checkout use.
  const [prices, setPrices] = useState<Record<string, number | undefined>>(() =>
    Object.fromEntries(ids.map((id) => [id, getProductById(id)?.priceUSD]))
  );
  const key = ids.join(",");
  useEffect(() => {
    let cancelled = false;
    Promise.all(ids.map((id) => fetchProductById(id).catch(() => null))).then((list) => {
      if (cancelled) return;
      setPrices((prev) => {
        const next = { ...prev };
        list.forEach((p, i) => {
          if (p && typeof p.priceUSD === "number" && p.priceUSD > 0) next[ids[i]] = p.priceUSD;
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return prices;
}

export default function BundleDetail() {
  const params = useParams<{ slug: string }>();
  const bundle = getMixedBundle(params.slug);
  if (!bundle || !canShowBundle(bundle, import.meta.env.VITE_BUNDLE_PREVIEW)) return <NotFound />;
  return <BundlePage bundle={bundle} />;
}

function BundlePage({ bundle }: { bundle: MixedBundle }) {
  const prices = useSinglePrices(bundle.productIds);
  const separately = boughtSeparatelyCents(bundle, (id) => prices[id]);
  const safety = bundleSafetyText(bundle);
  const subtitle = bundleSubtitle(bundle);
  const bottles = bundle.productIds.map((id) => {
    const p = getProductById(id);
    return { id, name: PRIME_PRODUCT_NAMES[id] ?? p?.name ?? id, image: p?.image };
  });

  return (
    <div className="min-h-screen flex flex-col bg-white" data-testid="bundle-page">
      <PageSeo {...bundleHead(bundle)} />
      <Navigation />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/products" className="inline-flex items-center gap-2 py-2 text-gray-500 hover:text-gray-900 mb-6 text-sm transition-colors">
            <ArrowLeft size={16} />
            Back to Products
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            {/* Bottle photos (every bottle in the bundle) + lifestyle photo of the same bottles (Regulatory-approved 2026-11-24). */}
            <div className="space-y-4">
              <div className={`grid gap-3 ${bottles.length === 3 ? "grid-cols-3" : "grid-cols-2"}`} data-testid="bundle-bottle-photos">
                {bottles.map((b) => {
                  const img = responsiveImage(b.image, "(min-width: 768px) 300px, 50vw");
                  return (
                    <div key={b.id} className="relative w-full aspect-square bg-white rounded-lg overflow-hidden border border-gray-200">
                      {img.src && (
                        <img
                          src={img.src}
                          srcSet={img.srcSet}
                          sizes={img.sizes}
                          alt={bottleAlt(b.id)}
                          className="w-full h-full object-contain p-3"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <img
                src={bundleLifestyleImage(bundle.slug)}
                width={BUNDLE_LIFESTYLE_SIZE}
                height={BUNDLE_LIFESTYLE_SIZE}
                // Above the fold at 1440 and 390 (it sits right under the bottle photos), so not lazy.
                decoding="async"
                alt={groupBottlesAlt(bundle)}
                className="w-full aspect-[16/9] object-cover object-[50%_75%] rounded-lg border border-gray-200"
                data-testid="bundle-lifestyle-image"
              />
            </div>

            {/* Purchase panel */}
            <div className="space-y-5">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border bg-orange-50 border-orange-200 text-orange-800">
                PEPTIDE BIOREGULATORS
              </span>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{bundle.name}</h1>
              <p className="text-base text-gray-700" data-testid="bundle-subtitle">{subtitle}</p>

              <div className="border-t border-b py-4">
                <div className="text-3xl font-bold text-gray-900" data-testid="bundle-price">{formatUSD(bundle.priceUSD)}</div>
                {separately !== undefined && (
                  <p className="text-sm text-gray-500 mt-1" data-testid="bundle-separately">
                    Bought separately: {formatUSDCents(separately)}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">One bottle of each product (90 capsules per bottle).</p>
              </div>

              {/* Go-live: remove "Coming soon" and wire add-to-cart (checkout already accepts
                  { mixedBundle: slug } for live bundles); re-check "Bought separately" against
                  live single prices that day. */}
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled
                  aria-disabled="true"
                  data-testid="bundle-add-to-cart"
                  className="w-full bg-gray-900 text-sm sm:text-base"
                >
                  <ShoppingCart className="mr-2" size={16} />
                  Coming soon
                </Button>
              </div>

              <div className="space-y-3" data-testid="bundle-description">
                <p className="text-gray-600 leading-relaxed">{bundle.intro}</p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                  {bundle.bullets.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                {bundle.outro && <p className="text-sm text-gray-700">{bundle.outro}</p>}
              </div>
            </div>
          </div>

          <div className="max-w-3xl space-y-8">
            <section data-testid="bundle-inside">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">What's inside</h2>
              <ul className="divide-y divide-gray-100">
                {bottles.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 py-3">
                    {b.image && (
                      <img src={b.image} alt="" className="h-14 w-14 shrink-0 rounded border border-gray-200 object-contain bg-white p-1" />
                    )}
                    <Link href={`/products/${b.id}`} className="min-w-0 flex-1 text-sm font-medium text-gray-900 hover:text-orange-600 hover:underline">
                      {b.name}
                    </Link>
                    <span className="text-sm text-gray-500">1 bottle</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-2 text-sm text-gray-700" data-testid="bundle-manufacturer-note">
              <p>{BUNDLE_MANUFACTURER_NOTE}</p>
              <p>{BUNDLE_NOT_STUDIED_NOTE}</p>
            </section>

            {safety && (
              <section data-testid="bundle-safety">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Safety</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{safety}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {bottles.map((b, i) => (
                    <span key={b.id}>
                      {i > 0 && " · "}
                      <Link href={`/products/${b.id}`} className="underline underline-offset-2 hover:text-gray-800">
                        {b.name} safety
                      </Link>
                    </span>
                  ))}
                </p>
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
