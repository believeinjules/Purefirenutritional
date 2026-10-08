/**
 * Site-wide trust settings. Every item renders ONLY when filled/approved.
 * Nothing here is a placeholder customers can see.
 */
export type FounderConfig = {
  /** Photo supplied by Julia (site path like /team/julia.jpg or https:// URL). */
  photoUrl: string;
  /** One line: why we carry these. */
  quote: string;
  /** e.g. "Julia Shulman, Co-founder" */
  attribution: string;
  /** Julia's sign-off on the exact quote + photo. Block stays hidden until true. */
  approved: boolean;
};

export type SiteTrustConfig = {
  /**
   * Link to the manufacturer's authorization document for Pure Fire as a US
   * retailer (PDF or image, site path or https:// URL). Until set, the
   * "Authorized US Retailer" badge shows WITHOUT a link.
   */
  authorizationDocUrl: string;
  founder: FounderConfig;
};

export const SITE_TRUST: SiteTrustConfig = {
  authorizationDocUrl: "", // Julia to supply the file
  founder: {
    photoUrl: "", // Julia to supply — do not pick a photo
    quote: "We carry what we can trace to its source, and we explain it before we sell it.",
    attribution: "Julia Shulman, Co-founder",
    approved: false, // Julia to approve the line + photo
  },
};

/** True when a URL value is usable (https:// or a site path). */
export function isUsableUrl(url: string | undefined | null): url is string {
  return typeof url === "string" && (/^https:\/\//i.test(url.trim()) || url.trim().startsWith("/"));
}

export function founderBlockVisible(f: FounderConfig = SITE_TRUST.founder): boolean {
  return f.approved === true && isUsableUrl(f.photoUrl) && f.quote.trim().length > 0;
}
