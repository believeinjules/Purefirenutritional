import { ShieldCheck, FileText } from "lucide-react";
import { SITE_TRUST, isUsableUrl } from "@/data/siteConfig";

type Props = {
  manufacturer?: string;
  lotNumber?: string;
  expiryDate?: string;
  coaUrl?: string;
  /** Override for tests / previews; defaults to SITE_TRUST.authorizationDocUrl. */
  authorizationDocUrl?: string;
};

export function formatExpiry(value: string): string {
  const m = value.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!m) return value;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mon = months[Number(m[2]) - 1] ?? m[2];
  return m[3] ? `${mon} ${Number(m[3])}, ${m[1]}` : `${mon} ${m[1]}`;
}

/**
 * "Authorized US Retailer" badge + sourcing line + lot / expiry / COA.
 * Each line renders only when its data is filled. The badge links to the
 * authorization document only once that URL is configured.
 */
export default function ProductAuthenticity({
  manufacturer,
  lotNumber,
  expiryDate,
  coaUrl,
  authorizationDocUrl = SITE_TRUST.authorizationDocUrl,
}: Props) {
  const docUrl = isUsableUrl(authorizationDocUrl) ? authorizationDocUrl : null;
  const mfr = manufacturer?.trim();
  const lot = lotNumber?.trim();
  const exp = expiryDate?.trim();
  const coa = isUsableUrl(coaUrl) ? coaUrl : null;

  const badgeInner = (
    <>
      <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
      Authorized US Retailer
    </>
  );

  return (
    <div className="space-y-2" data-testid="product-authenticity">
      {docUrl ? (
        <a
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-gray-400 transition-colors"
        >
          {badgeInner}
          <span className="text-gray-400">· View authorization</span>
        </a>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
          {badgeInner}
        </span>
      )}

      {mfr && <p className="text-sm text-gray-600">Imported directly from {mfr}, St. Petersburg</p>}

      {(lot || exp || coa) && (
        <dl className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600">
          {lot && (
            <div className="flex gap-1">
              <dt className="text-gray-400">Lot</dt>
              <dd className="font-medium text-gray-700">{lot}</dd>
            </div>
          )}
          {exp && (
            <div className="flex gap-1">
              <dt className="text-gray-400">Expires</dt>
              <dd className="font-medium text-gray-700">{formatExpiry(exp)}</dd>
            </div>
          )}
          {coa && (
            <div>
              <dt className="sr-only">Certificate of analysis</dt>
              <dd>
                <a
                  href={coa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-orange-700 hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" aria-hidden />
                  Certificate of analysis
                </a>
              </dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
