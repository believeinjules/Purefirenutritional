import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, XCircle, Trash2, Pencil, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { REVIEW_TAGS, REVIEW_TAG_LABELS, hasHealthClaim, reviewDisplayName, reviewKind, type ReviewStatus, type ReviewTag } from "@shared/reviews";
import { products as catalog } from "@/data/products";
import { reviewAdminApi, type AdminReview, type ReviewAdminApi } from "@/lib/reviewsAdmin";

const FILTERS: ReviewStatus[] = ["pending", "approved", "rejected"];

/**
 * Admin moderation list for Firestore `reviews` (all writes via
 * /api/admin/reviews). Approve / reject / delete, edit text to remove
 * disallowed wording, toggle verified buyer.
 */
export default function ReviewModeration({
  api = reviewAdminApi,
  onCountsChange,
}: {
  api?: ReviewAdminApi;
  onCountsChange?: (counts: Record<ReviewStatus, number>) => void;
}) {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReviewStatus>("pending");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setReviews(await api.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const counts = useMemo(() => {
    const c: Record<ReviewStatus, number> = { pending: 0, approved: 0, rejected: 0 };
    for (const r of reviews) c[r.status] += 1;
    return c;
  }, [reviews]);

  useEffect(() => {
    onCountsChange?.(counts);
  }, [counts, onCountsChange]);

  const productName = (r: AdminReview) => {
    const kind = reviewKind(r);
    if (kind === "general") return "General (not product-specific)";
    if (kind === "service") return "Service: buying from Pure Fire";
    return catalog.find((p) => p.id === r.productId)?.name ?? r.productId;
  };
  const shown = reviews.filter((r) => r.status === filter);

  const run = async (fn: () => Promise<void>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const saveText = (r: AdminReview) =>
    run(async () => {
      await api.update(r.id, { text: draft });
      setEditing(null);
    }, "Review text updated");

  return (
    <div className="space-y-4" data-testid="review-moderation">
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 flex gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
        <span>
          Before approving: no disease or cure claims (cured, treats, healed, "got off my meds"…). Edit those words out
          or reject. Reviews flagged below cannot be approved until the text is changed.
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Review status">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            role="tab"
            aria-selected={filter === f}
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f} <span className="ml-1.5 opacity-70">({counts[f]})</span>
          </Button>
        ))}
      </div>
        {api.checkOrders && (
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            title="Mark reviews verified when the email matches a paid order containing that product"
            onClick={async () => {
              try {
                const n = await api.checkOrders!();
                toast.success(n ? `${n} review${n === 1 ? "" : "s"} verified from orders` : "No new order matches");
                await load();
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Order check failed");
              }
            }}
          >
            <BadgeCheck className="h-4 w-4 mr-1" /> Check orders
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-center py-8 text-red-600">{error}</p>
      ) : shown.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No {filter} reviews.</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((r) => {
            const isEditing = editing === r.id;
            const claim = isEditing ? hasHealthClaim(draft) : r.healthClaim;
            return (
              <li key={r.id} className="rounded-lg border bg-white p-4 space-y-2" data-testid="admin-review">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <strong>{reviewDisplayName(r.firstName, r.lastInitial)}</strong>
                  {r.rating >= 1 && (
                    <span className="text-amber-500" aria-label={`${r.rating} out of 5`}>
                      {"★".repeat(r.rating)}
                      <span className="text-gray-300">{"★".repeat(5 - r.rating)}</span>
                    </span>
                  )}
                  <span className="text-gray-500">· {productName(r)}</span>
                  <span className="text-gray-500">· {r.date}</span>
                  {r.verified && (
                    <Badge variant="secondary">
                      <BadgeCheck className="h-3 w-3 mr-1" /> Verified buyer
                    </Badge>
                  )}
                  {r.tag && <Badge variant="secondary">{REVIEW_TAG_LABELS[r.tag]}</Badge>}
                  {reviewKind(r) === "service" && <Badge variant="outline">Service review</Badge>}
                  {r.source === "customer-form" && <Badge variant="outline">Review link</Badge>}
                  {claim && <Badge variant="destructive">Health claim</Badge>}
                </div>
                {r.email && <div className="text-xs text-gray-500">{r.email} (private)</div>}

                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveText(r)} disabled={!draft.trim()}>
                        Save text
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.text}</p>
                )}

                {!isEditing && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {r.status !== "approved" && (
                      <Button
                        size="sm"
                        disabled={r.healthClaim || !r.permission}
                        title={r.healthClaim ? "Edit out the health claim first" : !r.permission ? "No permission to publish" : undefined}
                        onClick={() => run(() => api.update(r.id, { status: "approved" }), "Approved — now live")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    )}
                    {r.status !== "rejected" && (
                      <Button size="sm" variant="outline" onClick={() => run(() => api.update(r.id, { status: "rejected" }), "Rejected")}>
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(r.id);
                        setDraft(r.text);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Edit text
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => run(() => api.update(r.id, { verified: !r.verified }), r.verified ? "Unmarked verified" : "Marked verified buyer")}
                    >
                      {r.verified ? "Unmark verified" : "Mark verified"}
                    </Button>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600">
                      Tag
                      <select
                        className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                        value={r.tag ?? ""}
                        aria-label="Public tag"
                        onChange={(e) => {
                          const next = (e.target.value || null) as ReviewTag | null;
                          run(() => api.update(r.id, { tag: next }), next ? `Tagged “${REVIEW_TAG_LABELS[next]}”` : "Tag removed");
                        }}
                      >
                        <option value="">None</option>
                        {REVIEW_TAGS.map((t) => (
                          <option key={t} value={t}>
                            {REVIEW_TAG_LABELS[t]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-red-600"
                      onClick={() => {
                        if (window.confirm(`Delete the review from ${reviewDisplayName(r.firstName, r.lastInitial)} permanently?`)) {
                          run(() => api.remove(r.id), "Deleted");
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
