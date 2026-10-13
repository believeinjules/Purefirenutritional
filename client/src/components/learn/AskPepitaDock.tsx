import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { askPepitaHref } from "./AskPepitaChip";

/**
 * Persistent "Ask Pepita to explain this" button. Tracks which [data-learn-section]
 * is on screen and offers simpler / more technical / evidence questions about it.
 */
export default function AskPepitaDock() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("Khavinson peptide bioregulators");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-learn-section]"));
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const t = vis?.target.getAttribute("data-learn-section");
        if (t) setTopic(t);
      },
      { rootMargin: "-30% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
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

  const options = [
    { label: "Explain it more simply", q: `Explain "${topic}" in simple terms, as if I'm new to peptides.` },
    { label: "Explain it more technically", q: `Give me a more technical explanation of "${topic}", including the proposed mechanisms.` },
    { label: "What's the evidence?", q: `What is the evidence for "${topic}"? Separate cell, animal and human findings.` },
  ];

  return (
    <div ref={ref} className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 print:hidden" data-testid="ask-pepita-dock">
      {open ? (
        <div id="pepita-dock-menu" className="w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
          <p className="mb-2 text-xs text-gray-500">
            About: <span className="font-medium text-gray-800">{topic}</span>
          </p>
          <ul className="space-y-1">
            {options.map((o) => (
              <li key={o.label}>
                <Link
                  href={askPepitaHref(o.q)}
                  className="block rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050]"
                >
                  {o.label}
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
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gray-900 py-1.5 pl-1.5 pr-4 text-sm text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050] focus-visible:ring-offset-2"
      >
        <img src="/images/pepita/avatar-128.webp" alt="" width={36} height={36} className="h-9 w-9 rounded-full" decoding="async" />
        Ask Pepita to explain this
      </button>
    </div>
  );
}
