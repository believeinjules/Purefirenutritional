import { useEffect } from "react";

export const KINETIC_QUERY = "(max-width: 767px) and (prefers-reduced-motion: no-preference)";

/**
 * Mobile-only kinetic type. Adds `kinetic-ready` to <html> (starts the
 * KineticHeading word animation) and reveals elements matching `selector`
 * once, when they scroll into view. Elements are only hidden (`kt-armed`)
 * after they are being observed, so nothing is ever stuck invisible.
 */
export function useKineticReveal(selector: string, deps: unknown[] = []) {
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia?.(KINETIC_QUERY).matches) return;
    document.documentElement.classList.add("kinetic-ready");
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("kt-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      if (el.classList.contains("kt-in")) return;
      el.classList.add("kt-armed");
      io.observe(el);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
