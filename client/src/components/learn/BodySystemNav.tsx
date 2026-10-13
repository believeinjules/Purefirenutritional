import { Link } from "wouter";
import { Activity, Brain, Hourglass, Layers, type LucideIcon } from "lucide-react";
import { BODY_SYSTEM_TILES } from "./learnData";
import type { ShopSystemId } from "@/data/systems";

const ICONS: Record<ShopSystemId, LucideIcon> = { brain: Brain, recovery: Activity, longevity: Hourglass, organ: Layers };

/** Visual navigation only: icon tiles that open the store filtered by body system. */
export default function BodySystemNav() {
  return (
    <nav aria-label="Explore by body system" className="mt-6">
      <p className="mb-3 text-sm font-medium text-gray-900">Explore by Body System →</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BODY_SYSTEM_TILES.map((t) => {
          const Icon = ICONS[t.id];
          return (
            <li key={t.id}>
              <Link
                href={t.href}
                data-system={t.id}
                className="flex h-full min-h-[112px] flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 p-3 text-center text-sm text-gray-800 transition-colors hover:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBE7E4] text-[#E06050]" aria-hidden>
                  <Icon className="h-5 w-5" />
                </span>
                {t.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
