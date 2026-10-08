import type { ReactNode } from "react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageSeo from "@/components/seo/PageSeo";
import {
  CONTACT_EMAIL,
  POLICY_LAST_UPDATED,
  POLICY_LIST,
  type Policy,
  type PolicyBlock,
} from "@/content/policies";

const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const linkClass = "text-orange-600 hover:underline";

/** Renders text with [label](href) links: site paths use the router, others open normally. */
export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of Array.from(text.matchAll(LINK_PATTERN))) {
    const [whole, label, href] = m;
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    if (href.startsWith("/")) {
      out.push(
        <Link key={at} href={href} className={linkClass}>
          {label}
        </Link>
      );
    } else {
      const external = /^https?:\/\//i.test(href);
      out.push(
        <a
          key={at}
          href={href}
          className={linkClass}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {label}
        </a>
      );
    }
    last = at + whole.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Block({ block }: { block: PolicyBlock }) {
  if (typeof block === "string") {
    return <p>{renderInline(block)}</p>;
  }
  if ("list" in block) {
    return (
      <ul className="list-disc pl-6 space-y-2">
        {block.list.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    );
  }
  return (
    <p className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800 font-medium">
      {renderInline(block.callout)}
    </p>
  );
}

/**
 * Shared layout for /privacy, /terms, /shipping and /returns. Uses the same
 * article layout as the Learn pages (Navigation, max-w-3xl column, section
 * label, H1, Footer). Copy lives in client/src/content/policies.ts.
 */
export default function PolicyPage({ policy }: { policy: Policy }) {
  const related = POLICY_LIST.filter((p) => p.key !== policy.key);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageSeo title={policy.metaTitle} description={policy.description} path={policy.path} type="website" />
      <Navigation />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 py-16">
          <p className="section-label mb-3">Policies</p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3">{policy.title}</h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: {POLICY_LAST_UPDATED}</p>

          <p className="text-gray-700 leading-relaxed text-lg mb-8">{renderInline(policy.intro)}</p>

          {policy.summary && (
            <ul className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4 space-y-2 text-gray-800">
              {policy.summary.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" aria-hidden />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          )}

          {policy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-3">{section.heading}</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                {section.body.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>
            </section>
          ))}

          <div className="mt-12 border-t border-gray-100 pt-6 text-sm text-gray-600 space-y-3">
            <p>
              Contact:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                {CONTACT_EMAIL}
              </a>
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <span className="text-gray-400">Related policies:</span>
              {related.map((p) => (
                <Link key={p.key} href={p.path} className={linkClass}>
                  {p.title}
                </Link>
              ))}
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
