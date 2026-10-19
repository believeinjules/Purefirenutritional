import { Link } from "wouter";
import PageSeo from "@/components/seo/PageSeo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Breadcrumbs, Intro } from "@/components/category/CategoryParts";
import { useCategoryCatalog } from "@/lib/categoryCatalog";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo/category";
import { SITE_URL, canonicalUrl } from "@/lib/seo";
import {
  BODY_SYSTEMS,
  CATEGORY_PAGES_LIVE,
  SYSTEMS_LANDING_PATH,
  browsePath,
  copyFor,
  pageProducts,
} from "@/data/bodySystems";

/** /products/system — tiles for every body-system group. */
export default function SystemsLanding() {
  const catalog = useCategoryCatalog();
  const copy = copyFor(SYSTEMS_LANDING_PATH);
  const tiles = BODY_SYSTEMS.map((s) => ({ page: s, count: pageProducts(s, catalog).length }));
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/products" },
    { name: "Shop by Body System", path: SYSTEMS_LANDING_PATH },
  ];
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.h1,
    url: canonicalUrl(SYSTEMS_LANDING_PATH),
    description: copy.meta,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/` },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: tiles.length,
      itemListElement: tiles.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: canonicalUrl(browsePath(t.page)),
        name: t.page.name,
      })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageSeo
        title={copy.title}
        description={copy.meta}
        path={SYSTEMS_LANDING_PATH}
        type="website"
        noindex={!CATEGORY_PAGES_LIVE}
        jsonLd={[ld, breadcrumbJsonLd(crumbs)]}
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
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" data-testid="system-tiles">
            {tiles.map(({ page, count }) => (
              <li key={page.slug}>
                <Link
                  href={browsePath(page)}
                  className="block h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow p-5"
                >
                  <span className="block font-semibold text-gray-900 hover:text-orange-600">{page.name}</span>
                  <span className="block text-sm text-gray-400 mt-1">
                    {count} product{count !== 1 ? "s" : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
