import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { askPepitaHref, PEPITA_SUGGESTIONS } from "./learnData";

type Topic = keyof typeof PEPITA_SUGGESTIONS;

/**
 * Small persistent round Pepita avatar. Never opens by itself; when opened it offers
 * 2–3 questions for the section in view ([data-pepita-topic]), prefilled via ?q=.
 */
export default function AskPepitaDock() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState<Topic>("intro");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting)[0];
        const t = vis?.target.getAttribute("data-pepita-topic") as Topic | null;
        if (t && t in PEPITA_SUGGESTIONS) setTopic(t);
      },
      { rootMargin: "-35% 0px -45% 0px" },
    );
    document.querySelectorAll("[data-pepita-topic]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 print:hidden" data-testid="ask-pepita-dock" data-topic={topic}>
      {open ? (
        <div id="pepita-dock-menu" className="w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
          <p className="mb-2 px-1 text-xs text-gray-500">Ask Pepita</p>
          <ul className="space-y-1">
            {PEPITA_SUGGESTIONS[topic].map((q) => (
              <li key={q}>
                <Link
                  href={askPepitaHref(q)}
                  className="block rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050]"
                >
                  {q}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="pepita-dock-menu"
        aria-label={open ? "Close Ask Pepita" : "Ask Pepita"}
        onClick={() => setOpen((v) => !v)}
        className="h-12 w-12 overflow-hidden rounded-full shadow-lg ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050] focus-visible:ring-offset-2"
      >
        <img src="/images/pepita/avatar-128.webp" alt="" width={48} height={48} decoding="async" className="h-12 w-12" />
      </button>
    </div>
  );
}
