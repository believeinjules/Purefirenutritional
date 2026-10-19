import { Link } from "wouter";
import PageSeo from "@/components/seo/PageSeo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Breadcrumbs, Intro } from "@/components/category/CategoryParts";
import { shortDescription, useCategoryCatalog } from "@/lib/categoryCatalog";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/category";
import { productPath } from "@/lib/seo";
import {
  CATEGORY_PAGES_LIVE,
  LIST_PAGE_PATH,
  browsePath,
  codeFor,
  copyFor,
  listPageGroups,
} from "@/data/bodySystems";

const TYPE_LABEL: Record<string, string> = {
  "PEPTIDE BIOREGULATORS": "Peptide bioregulator",
  "ANTI AGING-LONGEVITY": "Longevity formula",
  "NUTRITIONAL SUPPLEMENTS": "Nutritional supplement",
};

/** /khavinson-peptides-list — every sold product, grouped by body system. */
export default function KhavinsonPeptidesList() {
  const catalog = useCategoryCatalog();
  const copy = copyFor(LIST_PAGE_PATH);
  const groups = listPageGroups(catalog);
  const seen = new Set<string>();
  const unique = groups.flatMap((g) => g.products).filter((p) => !seen.has(p.id) && seen.add(p.id));
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Khavinson Peptides List", path: LIST_PAGE_PATH },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageSeo
        title={copy.title}
        description={copy.meta}
        path={LIST_PAGE_PATH}
        type="website"
        noindex={!CATEGORY_PAGES_LIVE}
        jsonLd={[
          collectionPageJsonLd({ name: copy.h1, path: LIST_PAGE_PATH, description: copy.meta, items: unique }),
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

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
          {groups.map((g) => (
            <section key={g.name} aria-labelledby={`grp-${g.name}`}>
              <h2 id={`grp-${g.name}`} className="text-xl font-semibold text-gray-900 mb-3">
                {g.page ? (
                  <Link href={browsePath(g.page)} className="hover:text-orange-600">{g.name}</Link>
                ) : (
                  g.name
                )}
              </h2>
              <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-gray-400">
                    <tr>
                      <th className="px-4 py-2 font-medium">Product</th>
                      <th className="px-4 py-2 font-medium">Type</th>
                      <th className="px-4 py-2 font-medium">Code</th>
                      <th className="px-4 py-2 font-medium hidden md:table-cell">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.products.map((p) => (
                      <tr key={p.id} className="border-t border-gray-50 align-top">
                        <td className="px-4 py-2.5 font-medium">
                          <Link href={productPath(p.id)} className="text-gray-900 hover:text-orange-600">{p.name}</Link>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">{TYPE_LABEL[p.category] ?? p.category}</td>
                        <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{codeFor(p.id) ?? "—"}</td>
                        <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell">{shortDescription(p.id) ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
