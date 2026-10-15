import manifest from "@shared/image-manifest.json";

type Entry = { w: number[]; ratio: number };
const MAP = manifest as Record<string, Entry>;

/**
 * Responsive WebP attributes for a local image that scripts/optimize-images.mjs processed.
 * Unknown/remote sources pass through unchanged (no srcset).
 */
export function responsiveImage(src: string | undefined, sizes: string, maxWidth = 960) {
  if (!src) return { src };
  const key = src.split("?")[0];
  const e = MAP[key];
  if (!e) return { src };
  const base = "/opt" + key.replace(/\.[^.]+$/, "");
  const widths = e.w.filter((w) => w <= maxWidth);
  const list = widths.length ? widths : [e.w[0]];
  const fallback = list.find((w) => w >= 640) ?? list[list.length - 1];
  return {
    src: `${base}-${fallback}.webp`,
    srcSet: list.map((w) => `${base}-${w}.webp ${w}w`).join(", "),
    sizes,
  };
}

/** Intrinsic aspect ratio (width / height) of a processed local image, if known. */
export function imageRatio(src: string | undefined): number | undefined {
  return src ? MAP[src.split("?")[0]]?.ratio : undefined;
}

/**
 * `fetchpriority` attribute for an <img>. React 18 only passes it through lowercase,
 * so spread this object instead of using a `fetchPriority` prop.
 */
export function fetchPriority(high: boolean): Record<string, string> {
  return high ? { fetchpriority: "high" } : {};
}
