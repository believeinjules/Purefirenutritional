import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ReviewModeration from "@/components/reviews/ReviewModeration";
import { products as catalog } from "@/data/products";
import { hasHealthClaim } from "@shared/reviews";
import { createReview, type ReviewInput } from "@/lib/reviewsAdmin";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): ReviewInput => ({
  productId: "",
  firstName: "",
  lastInitial: "",
  date: today(),
  text: "",
  rating: 5,
  verified: false,
  approved: false,
  permission: false,
});

/**
 * Admin → Reviews. Enter reviews customers sent with permission, then approve.
 * The server refuses approval without permission or when the text makes a
 * health claim (cured / treated / fixed …). Only approved reviews show on the site.
 */
export default function ReviewManager() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<ReviewInput>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [listKey, setListKey] = useState(0);

  const formClaim = hasHealthClaim(form.text);

  const submit = async () => {
    setSaving(true);
    try {
      await createReview(form);
      toast.success("Review saved");
      setForm(emptyForm());
      setListKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          <div>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => setLocation("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Admin
            </Button>
            <h1 className="text-3xl font-bold">Reviews</h1>
            <p className="text-gray-500 text-sm mt-1">
              Only reviews that are <strong>approved</strong>, have the customer's <strong>permission</strong>, and make
              no health claims appear on the site. Shown as "First L." with the date.
            </p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Add a review</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rv-product">Product</Label>
                  <select
                    id="rv-product"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  >
                    <option value="">Choose a product…</option>
                    {catalog
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Label htmlFor="rv-first">First name</Label>
                    <Input id="rv-first" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="rv-initial">Last initial</Label>
                    <Input id="rv-initial" maxLength={2} value={form.lastInitial} onChange={(e) => setForm({ ...form, lastInitial: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="rv-date">Date</Label>
                  <Input id="rv-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="rv-rating">Rating (1–5)</Label>
                  <Input
                    id="rv-rating"
                    type="number"
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="rv-text">Review text (exactly as the customer wrote it)</Label>
                <Textarea id="rv-text" rows={4} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
                {formClaim && (
                  <p className="mt-1 text-xs text-red-700 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Health-claim wording (e.g. cured, treated, fixed). This review cannot be approved.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-6 text-sm">
                <label className="flex items-center gap-2">
                  <Switch checked={form.verified} onCheckedChange={(v) => setForm({ ...form, verified: v })} /> Verified buyer
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={form.permission} onCheckedChange={(v) => setForm({ ...form, permission: v })} /> Customer gave permission to publish
                </label>
                <label className="flex items-center gap-2">
                  <Switch
                    checked={form.approved}
                    disabled={!form.permission || formClaim}
                    onCheckedChange={(v) => setForm({ ...form, approved: v })}
                  />{" "}
                  Approved
                </label>
              </div>
              <Button onClick={submit} disabled={saving}>
                <Plus className="h-4 w-4 mr-1" /> Save review
              </Button>
            </CardContent>
          </Card>

          <ReviewModeration key={listKey} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
