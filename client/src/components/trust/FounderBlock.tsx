import { SITE_TRUST, founderBlockVisible, type FounderConfig } from "@/data/siteConfig";

/**
 * Founder photo + one line ("why we carry these"). Hidden until Julia approves
 * it AND a photo URL is set (client/src/data/siteConfig.ts).
 */
export default function FounderBlock({ founder = SITE_TRUST.founder }: { founder?: FounderConfig }) {
  if (!founderBlockVisible(founder)) return null;
  return (
    <figure className="mt-12 flex items-center gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-6" data-testid="founder-block">
      <img
        src={founder.photoUrl}
        alt={founder.attribution}
        className="h-16 w-16 flex-shrink-0 rounded-full object-cover"
        loading="lazy"
      />
      <div>
        <blockquote
          className="text-xl leading-snug text-gray-900"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic" }}
        >
          “{founder.quote}”
        </blockquote>
        {founder.attribution && (
          <figcaption className="mt-1 text-xs uppercase tracking-widest text-gray-500">
            {founder.attribution}
          </figcaption>
        )}
      </div>
    </figure>
  );
}
