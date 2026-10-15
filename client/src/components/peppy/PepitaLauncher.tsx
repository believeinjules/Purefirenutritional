import { lazy, Suspense, useCallback, useRef, useState } from "react";
import PepitaAvatar from "@/components/peppy/PepitaAvatar";

// Chat UI + Pepita engine load only after the first click.
const PepitaChatPanel = lazy(() => import("@/components/peppy/PepitaChatPanel"));

/**
 * Small floating Pepita button (bottom-right, safe-area aware). Never opens on its
 * own and makes no sound. Opens a popover (desktop) / bottom sheet (mobile).
 */
export default function PepitaLauncher({ productId, productName }: { productId: string; productName: string }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to the launcher (WAI-ARIA dialog pattern).
    requestAnimationFrame(() => buttonRef.current?.focus());
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="pepita-widget"
        aria-label={open ? "Close Pepita chat" : `Ask Pepita about ${productName}`}
        onClick={() => {
          setLoaded(true);
          setOpen((v) => !v);
        }}
        onPointerEnter={() => setLoaded(true)}
        onFocus={() => setLoaded(true)}
        data-testid="pepita-launcher"
        className={`pepita-launcher fixed z-40 h-14 w-14 rounded-full bg-white p-1 shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100 print:hidden ${open ? "max-sm:hidden" : ""}`}
      >
        <PepitaAvatar size={48} decorative />
      </button>
      {loaded && (
        <Suspense fallback={null}>
          <PepitaChatPanel open={open} onClose={close} productId={productId} productName={productName} />
        </Suspense>
      )}
    </>
  );
}
