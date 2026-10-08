import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SPOT_A_FAKE, renderableItem } from "@/content/spotAFake";

/**
 * /how-to-spot-a-fake — copy lives in client/src/content/spotAFake.ts.
 * noindex while SPOT_A_FAKE.published is false (out of nav and sitemap).
 */
export default function HowToSpotAFake() {
  const items = SPOT_A_FAKE.items
    .map((item) => ({ item, parts: renderableItem(item) }))
    .filter((x): x is { item: (typeof SPOT_A_FAKE.items)[number]; parts: NonNullable<ReturnType<typeof renderableItem>> } => x.parts !== null);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>{`${SPOT_A_FAKE.title} | Pure Fire Nutritional`}</title>
        {!SPOT_A_FAKE.published && <meta name="robots" content="noindex, nofollow" />}
      </Helmet>
      <Navigation />
      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-4 py-16">
          <p className="section-label mb-3">Authenticity</p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">{SPOT_A_FAKE.title}</h1>
          <p className="text-gray-600 leading-relaxed mb-10">{SPOT_A_FAKE.intro}</p>

          <ol className="space-y-6">
            {items.map(({ item, parts }, i) => (
              <li key={item.title} className="flex gap-4">
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 text-orange-700 flex items-center justify-center text-sm font-medium"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{item.title}</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {[parts.sentence, parts.tail].filter(Boolean).join(" ")}
                    {parts.link && (
                      <>
                        {" "}
                        <a
                          href={parts.link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-700 hover:underline"
                        >
                          {parts.link.label}
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-12 border-t border-gray-100 pt-6 text-gray-600 leading-relaxed">
            {SPOT_A_FAKE.closing.text}{" "}
            <a href={`mailto:${SPOT_A_FAKE.closing.email}`} className="text-orange-700 hover:underline">
              {SPOT_A_FAKE.closing.email}
            </a>{" "}
            {SPOT_A_FAKE.closing.after}
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
