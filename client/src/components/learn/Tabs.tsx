import { useId, useRef, useState, type KeyboardEvent, type ReactNode, type TouchEvent } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

/** The one pill style (section nav, tabs, system pickers): outlined inactive, solid ink active. */
export function pillClass(active: boolean): string {
  return `inline-flex min-h-[40px] flex-shrink-0 items-center rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050] focus-visible:ring-offset-2 ${
    active ? "border-gray-900 bg-gray-900 font-medium text-white" : "border-gray-300 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900"
  }`;
}

/** Index the tablist moves to for a key (null = key not handled). Wraps around. */
export function nextTabIndex(key: string, active: number, count: number): number | null {
  const map: Record<string, number> = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: count - 1 };
  if (!(key in map)) return null;
  return (map[key] + count) % count;
}

/**
 * Accessible tabs (WAI-ARIA tablist, roving tabindex, ←/→/Home/End) with
 * horizontal swipe between panels on touch screens.
 */
export default function Tabs({
  items,
  label,
  initial = 0,
  onChange,
  className = "",
}: {
  items: TabItem[];
  label: string;
  initial?: number;
  onChange?: (index: number) => void;
  className?: string;
}) {
  const [active, setActive] = useState(initial);
  const base = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchX = useRef<number | null>(null);

  const select = (i: number, focus = false) => {
    const n = (i + items.length) % items.length;
    setActive(n);
    onChange?.(n);
    if (focus) tabRefs.current[n]?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = nextTabIndex(e.key, active, items.length);
    if (next !== null) {
      e.preventDefault();
      select(next, true);
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) select(active + (dx < 0 ? 1 : -1));
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKey}
        className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
      >
        {items.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${base}-tab-${t.id}`}
            aria-selected={i === active}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
            data-testid={`tab-${t.id}`}
            className={pillClass(i === active)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {items.map((t, i) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={i !== active}
          tabIndex={0}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="mt-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050]"
          data-testid={`panel-${t.id}`}
        >
          {t.content}
        </div>
      ))}
      <p className="mt-2 text-center text-[11px] text-gray-400 sm:hidden" aria-hidden>
        Swipe to switch · {active + 1} / {items.length}
      </p>
    </div>
  );
}
