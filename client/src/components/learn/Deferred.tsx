import { useEffect, useRef, useState, type ReactNode } from "react";

/** Mounts children when the placeholder nears the viewport (or a hash targets content below). */
export default function Deferred({ children, minHeight = 600, eagerIds = [] }: { children: ReactNode; minHeight?: number; eagerIds?: string[] }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if ((hash && eagerIds.includes(hash)) || typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setShow(true), { rootMargin: "600px 0px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return show ? <>{children}</> : <div ref={ref} style={{ minHeight }} aria-hidden />;
}
