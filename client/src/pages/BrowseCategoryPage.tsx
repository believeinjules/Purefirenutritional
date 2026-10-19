import { Link, useParams } from "wouter";
import PageSeo from "@/components/seo/PageSeo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NotFound from "@/pages/NotFound";
import { ProductGridCard } from "@/components/ProductListingCard";
import { Breadcrumbs, Intro } from "@/components/category/CategoryParts";
import { useReviewSummaries } from "@/lib/reviewsApi";
import { shortDescription, useCategoryCatalog } from "@/lib/categoryCatalog";
import { breadcrumbJsonLd, collectionPageJsonLd, type Crumb } from "@/lib/seo/category";
import {
  BODY_SYSTEMS,
  COLLECTIONS,
  CATEGORY_PAGES_LIVE,
  GOALS,
  LIST_PAGE_PATH,
  SYSTEMS_LANDING_PATH,
  browsePath,
  copyFor,
  getBrowsePage,
  pageProducts,
  type BrowseKind,
} from "@/data/bodySystems";

const SIBLINGS: Record<BrowseKind, { heading: string; pages: typeof BODY_SYSTEMS }> = {
  system: { heading: "Other body systems", pages: BODY_SYSTEMS },
  collection: { heading: "Other collections", pages: COLLECTIONS },
  goal: { heading: "Other goals", pages: GOALS },
};

const pill =
  "inline-block px-3 py-1.5 rounded-full text-xs font-medium border bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900";

/** /products/system/:slug, /products/collection/:slug, /products/goal/:slug */
export default function BrowseCategoryPage({ kind }: { kind: BrowseKind }) {
  const params = useParams<{ slug: string }>();
  const page = getBrowsePage(kind, params.slug);
  const catalog = useCategoryCatalog();
  const reviewSummaries = useReviewSummaries();
  if (!page) return <NotFound />;

  const path = browsePath(page);
  const copy = copyFor(path);
  const items = pageProducts(page, catalog);
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/products" },
    ...(kind === "system" ? [{ name: "Shop by Body System", path: SYSTEMS_LANDING_PATH }] : []),
    { name: page.name, path },
  ];
  const siblings = SIBLINGS[kind];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageSeo
        title={copy.title}
        description={copy.meta}
        path={path}
        type="website"
        noindex={!CATEGORY_PAGES_LIVE}
        jsonLd={[collectionPageJsonLd({ name: copy.h1, path, description: copy.meta, items }), breadcrumbJsonLd(crumbs)]}
      />
      <Navigation />
      <main className="flex-1">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <Breadcrumbs crumbs={crumbs} />
            <h1 className="text-4xl font-bold tracking-tight mb-4">{copy.h1}</h1>
            <Intro paragraphs={copy.intro} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-sm text-gray-400 mb-5">
            {items.length} product{items.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5" data-testid="browse-grid">
            {items.map((product) => (
              <ProductGridCard
                key={product.id}
                product={{ ...product, description: shortDescription(product.id) }}
                reviewSummary={reviewSummaries[product.id]}
              />
            ))}
          </div>

          <section className="mt-12" aria-labelledby="related-browse">
            <h2 id="related-browse" className="text-lg font-semibold text-gray-900 mb-3">{siblings.heading}</h2>
            <ul className="flex flex-wrap gap-2">
              {siblings.pages
                .filter((s) => s.slug !== page.slug)
                .map((s) => (
                  <li key={s.slug}>
                    <Link href={browsePath(s)} className={pill}>{s.name}</Link>
                  </li>
                ))}
              <li>
                <Link href={LIST_PAGE_PATH} className={pill}>All Khavinson Peptides</Link>
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
