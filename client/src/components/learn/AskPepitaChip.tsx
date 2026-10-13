import { Link } from "wouter";

/** /ai-assistant?q=… — the assistant puts q in its input box (not auto-sent). */
export function askPepitaHref(question: string): string {
  return `/ai-assistant?${new URLSearchParams({ q: question }).toString()}`;
}

export default function AskPepitaChip({
  question,
  label = "Ask Pepita about this",
  className = "",
}: {
  question: string;
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href={askPepitaHref(question)}
      className={`inline-flex min-h-[40px] max-w-full items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3.5 text-sm text-gray-700 transition-colors hover:border-[#E06050] hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050] focus-visible:ring-offset-2 ${className}`}
      data-testid="ask-pepita-chip"
      aria-label={`${label}: ${question}`}
    >
      <img
        src="/images/pepita/avatar-128.webp"
        alt=""
        width={30}
        height={30}
        loading="lazy"
        decoding="async"
        className="h-[30px] w-[30px] flex-shrink-0 rounded-full"
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}
