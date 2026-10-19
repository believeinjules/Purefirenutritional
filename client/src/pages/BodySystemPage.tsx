import { Link, useParams } from "wouter";
import PageSeo from "@/components/seo/PageSeo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NotFound from "@/pages/NotFound";
import { ProductGridCard } from "@/components/ProductListingCard";
import { Breadcrumbs, Intro } from "@/components/category/CategoryParts";
import { useReviewSummaries } from "@/lib/reviewsApi";
import { shortDescription, useCategoryCatalog } from "@/lib/categoryCatalog";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/category";
import {
  BODY_SYSTEMS,
  CATEGORY_PAGES_LIVE,
  LIST_PAGE_PATH,
  copyFor,
  getBodySystem,
  systemPath,
  systemProducts,
} from "@/data/bodySystems";

/** /products/system/:system — one body-system collection page. */
export default function BodySystemPage() {
  const params = useParams<{ system: string }>();
  const system = getBodySystem(params.system);
  const catalog = useCategoryCatalog();
  const reviewSummaries = useReviewSummaries();
  if (!system) return <NotFound />;

  const path = systemPath(system.slug);
  const copy = copyFor(path);
  const items = systemProducts(system, catalog);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: system.name, path },
  ];
  const related = BODY_SYSTEMS.filter((s) => s.slug !== system.slug);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageSeo
        title={copy.title}
        description={copy.meta}
        path={path}
        type="website"
        noindex={!CATEGORY_PAGES_LIVE}
        jsonLd={[
          collectionPageJsonLd({ name: copy.h1, path, description: copy.meta, items }),
          breadcrumbJsonLd(crumbs),
        ]}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5" data-testid="system-grid">
            {items.map((product) => (
              <ProductGridCard
                key={product.id}
                product={{ ...product, description: shortDescription(product.id) }}
                reviewSummary={reviewSummaries[product.id]}
              />
            ))}
          </div>

          <section className="mt-12" aria-labelledby="related-systems">
            <h2 id="related-systems" className="text-lg font-semibold text-gray-900 mb-3">Related body systems</h2>
            <ul className="flex flex-wrap gap-2">
              {related.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={systemPath(s.slug)}
                    className="inline-block px-3 py-1.5 rounded-full text-xs font-medium border bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={LIST_PAGE_PATH}
                  className="inline-block px-3 py-1.5 rounded-full text-xs font-medium border bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                >
                  Khavinson Peptides List
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
