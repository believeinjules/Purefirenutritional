import type { ReactNode } from "react";

/** Article section with eyebrow, heading and a topic name for the Pepita dock. */
export default function Section({
  id,
  eyebrow,
  title,
  topic,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  topic?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} data-learn-section={topic ?? title} aria-labelledby={`${id}-h`} className="scroll-mt-28 py-10 sm:py-14">
      {eyebrow ? <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#B8463A]">{eyebrow}</p> : null}
      <h2 id={`${id}-h`} className="mt-1 text-3xl leading-tight text-gray-900 sm:text-4xl">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
