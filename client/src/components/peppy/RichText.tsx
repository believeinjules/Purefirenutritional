import { Fragment, type ReactNode } from "react";

/** Inline **bold** only — everything else is rendered as plain text (no HTML injection). */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i} className="font-semibold text-gray-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

/** Markdown-light: blank-line paragraphs, "- " bullet lists, numbered lists, **bold**. */
export default function RichText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const blocks = text
    .split(/\n{2,}/)
    .map(b => b.trim())
    .filter(Boolean);
  return (
    <div className={`space-y-2 ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block
          .split("\n")
          .map(l => l.trim())
          .filter(Boolean);
        if (lines.every(l => /^[-•*]\s+/.test(l))) {
          return (
            <ul
              key={bi}
              className="list-disc space-y-1 pl-5 marker:text-orange-400"
            >
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^[-•*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (lines.every(l => /^\d+[.)]\s+/.test(l))) {
          return (
            <ol key={bi} className="list-decimal space-y-1 pl-5">
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\d+[.)]\s+/, ""))}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
