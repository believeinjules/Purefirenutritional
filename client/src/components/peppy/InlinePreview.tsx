import { useRef, useState, type ReactElement, type ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as PopoverPrimitive from "@radix-ui/react-popover";

/**
 * Inline link with a small preview bubble.
 * Mouse: hover opens, click follows the link. Keyboard: focus opens, Enter follows, Esc closes.
 * Touch: first tap opens the bubble (which has its own clear "open" button), second tap follows.
 */
export default function InlinePreview({
  children,
  content,
  label,
  className = "w-72",
}: {
  /** A single link element (<a> or wouter <Link>). */
  children: ReactElement;
  content: ReactNode;
  /** Accessible name for the bubble. */
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const pointer = useRef<string>("mouse");
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const later = (next: boolean, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), ms);
  };
  const cancel = () => window.clearTimeout(timer.current);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor asChild>
        <Slot
          ref={triggerRef as never}
          aria-expanded={open}
          onPointerDown={(e: React.PointerEvent) => {
            pointer.current = e.pointerType;
          }}
          onPointerEnter={(e: React.PointerEvent) => {
            if (e.pointerType === "mouse") later(true, 200);
          }}
          onPointerLeave={(e: React.PointerEvent) => {
            if (e.pointerType === "mouse") later(false, 200);
          }}
          onFocus={() => {
            if (pointer.current !== "touch") later(true, 0);
          }}
          onBlur={(e: React.FocusEvent) => {
            if (!contentRef.current?.contains(e.relatedTarget as Node)) later(false, 120);
          }}
          onClick={(e: React.MouseEvent) => {
            if (pointer.current === "touch" && !open) {
              e.preventDefault();
              cancel();
              setOpen(true);
            }
            pointer.current = "mouse";
          }}
        >
          {children}
        </Slot>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={contentRef}
        role="dialog"
        aria-label={label}
        align="start"
        sideOffset={6}
        collisionPadding={12}
        onOpenAutoFocus={e => e.preventDefault()}
        onCloseAutoFocus={e => e.preventDefault()}
        onEscapeKeyDown={() => triggerRef.current?.focus()}
        onPointerEnter={cancel}
        onPointerLeave={(e: React.PointerEvent) => {
          if (e.pointerType === "mouse") later(false, 200);
        }}
        onBlur={(e: React.FocusEvent) => {
          const to = e.relatedTarget as Node | null;
          if (!contentRef.current?.contains(to) && to !== triggerRef.current)
            later(false, 120);
        }}
        className={`z-50 rounded-xl border max-w-[calc(100vw-1.5rem)] border-orange-100 bg-white p-3 text-left shadow-lg ${className}`}
      >
        {content}
      </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
