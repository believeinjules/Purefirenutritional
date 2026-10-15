import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Product-page drop-down built on native <details>/<summary>: the content is
 * always in the (prerendered) HTML for search engines, works without JS, and is
 * keyboard operable (Enter/Space on the summary). aria-expanded mirrors state.
 * Animation lives in index.css (.pdp-acc) and is disabled for reduced motion.
 */
export default function PdpAccordion({
  title,
  children,
  testId,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  testId?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      className="pdp-acc group border-b border-gray-200"
      open={defaultOpen || undefined}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      data-testid={testId}
    >
      <summary
        aria-expanded={open}
        className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 rounded-sm [&::-webkit-details-marker]:hidden"
      >
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className="pdp-acc-chevron flex-shrink-0 text-gray-500 group-open:rotate-180"
        />
      </summary>
      <div className="pdp-acc-body pb-5 pt-1">{children}</div>
    </details>
  );
}
