import { useState, useEffect, useContext } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Star, ShoppingCart, Plus, Minus, Heart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductAuthenticity from "@/components/trust/ProductAuthenticity";
import FounderBlock from "@/components/trust/FounderBlock";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import AskPeppyButton from "@/components/guidance/AskPeppyButton";
import ProtocolTabs, { type ProtocolSelection } from "@/components/guidance/ProtocolTabs";
import DoctorQuestionsCard from "@/components/guidance/DoctorQuestionsCard";
import { toast } from 'sonner';
import { fetchProductById, Product } from "@/lib/productsStorage";
import ProductImageGallery from "@/components/ProductImageGallery";
import VariantSelector from "@/components/VariantSelector";
import BundleSelector, { type BundleChoice } from "@/components/shop/BundleSelector";
import RatingStars from "@/components/shop/RatingStars";
import { getProductFacts } from "@/lib/productFacts";
import { useReviewSummaries } from "@/lib/reviewsApi";
import { getCartLineUnitUSD } from "@shared/product-prices";
import FrequentlyBoughtTogether from "@/components/FrequentlyBoughtTogether";
import { getProductById } from "@/data/products";
import ProductReviews from "@/components/reviews/ProductReviews";
import { getRecommendations } from "@/data/productRecommendations";
import { variantToCartSize, type CartSize } from "@/lib/productSize";
import { getUnitPriceUSD } from "@shared/product-prices";
import AuthenticityDocumentation from "@/components/documentation/AuthenticityDocumentation";
import PageSeo from "@/components/seo/PageSeo";
import { SeoProductContext } from "@/components/seo/SeoProductContext";
import { productHead } from "@/lib/seo";
import { getPdpContent } from "@shared/product-facts";
import PdpAccordion from "@/components/shop/PdpAccordion";
import SimilarProducts from "@/components/shop/SimilarProducts";
import { getPublicProtocol, goalsWithData } from "@/data/protocols";
import { lazy, Suspense } from "react";
const PepitaLauncher = lazy(() => import("@/components/peppy/PepitaLauncher"));

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm">
          <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-400" />
          <span className="text-gray-700">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const prerenderProduct = useContext(SeoProductContext);
  // Build-time prerender: render the full page body (H1, copy, price) from the
  // catalog snapshot instead of "Loading product...". In the browser the
  // context is null, so state starts empty and Firestore loads as before.
  const ssrProduct =
    prerenderProduct && prerenderProduct.id === id ? (prerenderProduct as unknown as Product) : null;
  const [product, setProduct] = useState<Product | null>(ssrProduct);
  const [loading, setLoading] = useState(!ssrProduct);
  const [protocolSelection, setProtocolSelection] = useState<ProtocolSelection>({});
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(
    () => ssrProduct?.variants?.find((v: any) => v.inStock) ?? ssrProduct?.variants?.[0] ?? null
  );
  const [inWishlist, setInWishlist] = useState(false);
  const [bundle, setBundle] = useState<BundleChoice>(1);
  const reviewSummaries = useReviewSummaries();

  const { addToCart } = useCart();
  const { addItem, removeItem, isInWishlist } = useWishlist();

  // Head tags (title, description, canonical, share card, Product JSON-LD).
  // Live product once loaded; until then the build-time snapshot (prerender)
  // or the code catalog, so the tags exist before Firestore answers.
  const seoProduct =
    product ??
    (prerenderProduct && prerenderProduct.id === id ? prerenderProduct : null) ??
    (id ? getProductById(id) ?? null : null);
  const seo = seoProduct ? (
    <PageSeo {...productHead(seoProduct)} />
  ) : loading ? null : (
    <PageSeo title="Product Not Found | Pure Fire Nutritional" noindex />
  );

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchProductById(id);
      setProduct(data);
      if (data?.variants?.length) {
        const firstInStock = data.variants.find((v: any) => v.inStock) || data.variants[0];
        setSelectedVariant(firstInStock);
      }
      if (data) setInWishlist(isInWishlist(data.id));
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        {seo}
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading product...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        {seo}
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Link href="/products"><Button>Back to Products</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Display the same price checkout charges: the live product (Firestore, with
  // code-catalog fallback inside fetchProductById) for the size picked.
  const selectedSize: CartSize = selectedVariant
    ? variantToCartSize(selectedVariant)
    : "20";
  const liveUnit = getUnitPriceUSD(product, selectedSize, selectedVariant?.id);
  const currentPrice =
    typeof liveUnit === "number" && Number.isFinite(liveUnit) && liveUnit > 0
      ? liveUnit
      : undefined;
  const priceLabel =
    typeof currentPrice === "number" && Number.isFinite(currentPrice)
      ? `$${currentPrice.toFixed(2)}`
      : "Price unavailable";
  const facts = getProductFacts(product, selectedVariant ? selectedSize : undefined, currentPrice);
  // Bundle line total (display only; checkout recomputes it server-side).
  // A bundle that is not offered for the selected size falls back to a single bottle.
  const bundleOfferTotal = bundle > 1 ? getCartLineUnitUSD(product, selectedSize, bundle) : undefined;
  const activeBundle: BundleChoice = bundle > 1 && bundleOfferTotal === undefined ? 1 : bundle;
  const bundleTotal = activeBundle > 1 ? bundleOfferTotal : currentPrice;
  // Full PDP copy (shared/product-facts.json → pdp), when written for this product.
  const pdp = getPdpContent(product.id);
  // Decision (2026-10-14): conflicting/held directions show "Follow the directions on your package.";
  // Endoluten keeps its current storefront usage text for now.
  const usageText = pdp && product.id !== "endoluten" ? pdp.directions : product.usage;
  // Key Benefits: soft-worded pdp.formulatedFor when written, else the catalog benefits list already shown on the page.
  const keyBenefits: string[] = pdp?.formulatedFor?.length ? pdp.formulatedFor : product.benefits ?? [];
  const ingredientList = pdp?.ingredients?.length ? pdp.ingredients : product.ingredients;
  const hasProtocol = goalsWithData(getPublicProtocol(product.id) ?? undefined).length > 0;
  const currentImage = selectedVariant?.image || product.image;
  const currentImages = selectedVariant?.images || (currentImage ? [currentImage] : product.images || []);

  const handleWishlistToggle = async () => {
    try {
      if (inWishlist) {
        await removeItem(product.id);
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await addItem({ id: product.id, name: product.name, price: currentPrice ?? product.priceUSD, image: currentImage });
        setInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const getCategoryAccent = () => {
    switch (product.category) {
      case "PEPTIDE BIOREGULATORS": return "bg-orange-50 border-orange-200 text-orange-800";
      case "ANTI AGING-LONGEVITY": return "bg-purple-50 border-purple-200 text-purple-800";
      case "NUTRITIONAL SUPPLEMENTS": return "bg-emerald-50 border-emerald-200 text-emerald-800";
      default: return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {seo}
      <Navigation />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Back */}
          <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 text-sm transition-colors">
            <ArrowLeft size={16} />
            Back to Products
          </Link>

          {/* Top grid: image + purchase info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">

            {/* Image gallery */}
            <ProductImageGallery images={currentImages} productName={product.name} />

            {/* Purchase panel */}
            <div className="space-y-5">
              {/* Category badge */}
              <span className={`inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${getCategoryAccent()}`}>
                {product.category}
              </span>

              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              {pdp?.lineCode && (
                <div className="space-y-2" data-testid="pdp-header">
                  <p className="text-base text-gray-700">{pdp.title.split(" | ")[1]}</p>
                  <p className="text-sm text-gray-500">{pdp.lineCode}</p>
                  <ul className="flex flex-wrap gap-2" aria-label="Areas">
                    {(pdp.tags ?? []).map((t) => (
                      <li key={t} className="text-xs text-gray-700 px-3 py-1 rounded-full border border-gray-200 bg-gray-50">{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stars — approved reviews only; nothing when there are none */}
              <RatingStars summary={reviewSummaries[product.id]} size={15} href="#reviews" />

              {/* Price */}
              <div className="border-t border-b py-4">
                <div className="text-3xl font-bold text-gray-900">{priceLabel}</div>
                {(facts.sizeLabel || facts.coverageLabel || facts.costPerDayUSD !== undefined) && (
                  <p className="text-sm text-gray-500 mt-1" data-testid="product-facts">
                    {[
                      facts.sizeLabel,
                      facts.coverageLabel,
                      facts.costPerDayUSD !== undefined ? `$${facts.costPerDayUSD.toFixed(2)}/day` : undefined,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>

              {/* Variant selector */}
              {product.variants && product.variants.length > 1 && (
                <VariantSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                />
              )}

              {/* Cycle bundles (2 / 3 bottles of the selected size) */}
              <BundleSelector
                product={product}
                singlePriceUSD={currentPrice}
                size={selectedVariant ? selectedSize : undefined}
                facts={facts}
                value={activeBundle}
                onChange={setBundle}
              />

              {/* Quantity + Add to cart */}
              <div className="flex gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="px-4 font-semibold text-sm min-w-[2rem] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                <Button
                  onClick={() => {
                    if (currentPrice === undefined) {
                      toast.error("This product's price is unavailable, so it can't be added.");
                      return;
                    }
                    if (activeBundle > 1 && bundleTotal === undefined) {
                      toast.error("This bundle is not available for this size.");
                      return;
                    }
                    addToCart(product, quantity, selectedSize, activeBundle > 1 ? (activeBundle as 2 | 3) : undefined);
                    toast.success(activeBundle > 1 ? `${activeBundle}-bottle bundle added to cart!` : 'Added to cart!');
                  }}
                  className="flex-1 bg-gray-900 hover:bg-orange-600 transition-colors"
                >
                  <ShoppingCart className="mr-2" size={16} />
                  {activeBundle > 1 && typeof bundleTotal === "number"
                    ? `Add ${activeBundle} bottles · $${(bundleTotal * quantity).toFixed(2)}`
                    : "Add to Cart"}
                </Button>
                <Button onClick={handleWishlistToggle} variant="outline" size="icon">
                  <Heart size={16} className={inWishlist ? "fill-red-500 text-red-500" : ""} />
                </Button>
              </div>

            </div>
          </div>

          {/* Detail sections below the fold */}
          <div className="max-w-3xl space-y-8">

              {/* Intro + Key Benefits stay visible; every other description category is a
                  drop-down (native <details>, so all copy stays in the prerendered HTML). */}
              {pdp ? (
                <section data-testid="pdp-overview">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">About This Product</h2>
                  <p className="text-gray-600 leading-relaxed">{pdp.overview[0]}</p>
                </section>
              ) : product.description && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">About This Product</h2>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </section>
              )}

              {keyBenefits.length > 0 && (
                <section data-testid="pdp-key-benefits">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">Key Benefits</h2>
                  <BulletList items={keyBenefits} />
                  <p className="mt-3 text-xs text-gray-500">
                    These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.
                  </p>
                </section>
              )}

              <div className="border-t border-gray-200" data-testid="pdp-accordions">
                {pdp && (pdp.overview.length > 1 || pdp.why || pdp.interest || pdp.researchBackground) && (
                  <PdpAccordion title={`More About ${product.name}`} testId="pdp-why">
                    <div className="space-y-3">
                      {pdp.overview.slice(1).map((para, i) => <p key={i} className="text-gray-600 leading-relaxed">{para}</p>)}
                      {pdp.why && (
                        <>
                          <h3 className="font-semibold text-gray-900 pt-1">{`Why ${product.name}?`}</h3>
                          <p className="text-gray-600 leading-relaxed">{pdp.why}</p>
                        </>
                      )}
                      {pdp.interest && (
                        <div data-testid="pdp-interest">
                          <h3 className="font-semibold text-gray-900 pt-1 mb-2">Areas of Scientific Interest</h3>
                          <BulletList items={pdp.interest} />
                          {pdp.interestNote && <p className="mt-3 text-xs text-gray-500">{pdp.interestNote}</p>}
                        </div>
                      )}
                      {pdp.researchBackground && (
                        <div className="pt-2">
                          <PdpAccordion title="Research Background" testId="pdp-research" nested>
                            <p className="text-gray-600 leading-relaxed">{pdp.researchBackground}</p>
                          </PdpAccordion>
                        </div>
                      )}
                    </div>
                  </PdpAccordion>
                )}

                {ingredientList && ingredientList.length > 0 && (
                  <PdpAccordion title="Active Ingredients" testId="pdp-ingredients">
                    <BulletList items={ingredientList} />
                  </PdpAccordion>
                )}

                {hasProtocol && (
                  <PdpAccordion title="Manufacturer Protocol" testId="pdp-directions">
                    {/* Manufacturer protocol — renders only when reviewed data exists */}
                    <ProtocolTabs productId={product.id} onSelectionChange={setProtocolSelection} />
                  </PdpAccordion>
                )}

                {pdp && pdp.faq.length > 0 && (
                  <PdpAccordion title="Frequently Asked Questions" testId="pdp-faq">
                    <dl className="space-y-4">
                      {pdp.faq.map((f, i) => (
                        <div key={i}>
                          <dt className="font-medium text-gray-900">{f.q}</dt>
                          <dd className="mt-1 text-gray-600 leading-relaxed">{f.a}</dd>
                        </div>
                      ))}
                    </dl>
                  </PdpAccordion>
                )}

                <PdpAccordion title="Questions to Ask Your Doctor" testId="pdp-doctor">
                  <DoctorQuestionsCard productName={product.name} />
                </PdpAccordion>

                {pdp && (
                  <PdpAccordion title="Safety" testId="pdp-safety">
                    <div className="text-sm text-gray-700 space-y-2">
                      <p>{pdp.safety}</p>
                      <p className="text-xs text-gray-500">{pdp.disclaimer}</p>
                    </div>
                  </PdpAccordion>
                )}
              </div>

              {/* Notes + Pepita, moved from the purchase panel to the end of the description */}
              <div className="space-y-4" data-testid="pdp-end-boxes">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                  <p>Ask your doctor about current medications, pregnancy, and existing conditions before use.</p>
                  <p>If you have an allergic reaction, an adverse effect, or a concern, discontinue use and seek medical care.</p>
                  <p>Please consult your medical doctor. These statements have not been evaluated by the FDA.</p>
                </div>

                {/* Authorized retailer badge + sourcing / lot / expiry / COA (each only when filled) */}
                <ProductAuthenticity
                  manufacturer={product.manufacturer}
                  lotNumber={product.lotNumber}
                  expiryDate={product.expiryDate}
                  coaUrl={product.coaUrl}
                />

                {/* Oral bioregulator disclaimer — shown for peptide bioregulator products */}
                {product.category === "PEPTIDE BIOREGULATORS" && (
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex items-start gap-3">
                    <span className="text-orange-500 text-sm mt-0.5 flex-shrink-0">ⓘ</span>
                    <p className="text-xs text-orange-800 leading-relaxed">
                      <strong>Oral bioregulator dietary supplement.</strong> Not an injectable peptide. These are short, tissue-specific Khavinson peptide bioregulators taken orally as capsules or lingual drops — a different class from injectable research peptides or GLP-1 medications.
                    </p>
                  </div>
                )}

                {/* Usage callout */}
                {usageText && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4" data-testid="usage-callout">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Recommended Usage</p>
                    <p className="text-sm text-blue-800 leading-relaxed">{usageText}</p>
                  </div>
                )}

                <AskPeppyButton
                  productId={product.id}
                  goal={protocolSelection.goal}
                  sex={protocolSelection.sex}
                />
              </div>

              {/* Product line info closes the description area, after the Pepita row */}
              {product.seriesInfo && (
                <section data-testid="pdp-line">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">About This Product Line</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{product.seriesInfo}</p>
                </section>
              )}
          </div>

          <AuthenticityDocumentation productId={product.id} />

          {/* Founder line — hidden until Julia approves it and a photo is set */}
          <FounderBlock />

          {/* Frequently bought together — catalog-backed companions only */}
          {(() => {
            const catalogProduct = getProductById(product.id);
            if (!catalogProduct) return null;
            const recommendations = getRecommendations(catalogProduct.id, 2)
              .map((rec) => {
                const companion = getProductById(rec.productId);
                return companion ? { product: companion, reason: rec.reason } : null;
              })
              .filter((r): r is { product: NonNullable<ReturnType<typeof getProductById>>; reason?: string } => r !== null);
            if (recommendations.length === 0) return null;
            return (
              <div className="mt-12">
                <FrequentlyBoughtTogether
                  currentProduct={catalogProduct}
                  recommendations={recommendations}
                />
              </div>
            );
          })()}

          {/* Similar products — biological relevance, sold products only */}
          <SimilarProducts productId={product.id} />

          <ProductReviews productId={product.id} productName={product.name} />

        </div>
      </main>
      <Footer />
      {/* Floating Pepita: browser only, chat code loaded on demand */}
      {typeof window !== "undefined" && (
        <Suspense fallback={null}>
          <PepitaLauncher productId={product.id} productName={product.name} />
        </Suspense>
      )}
    </div>
  );
}
