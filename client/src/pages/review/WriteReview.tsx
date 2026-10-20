import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { Star, CheckCircle2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageSeo from "@/components/seo/PageSeo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PUBLIC_REVIEW_TEXT_MAX, PUBLIC_NAME_MAX } from "@shared/reviews";
import { CONSENT_LABEL, GENERAL_REVIEW_VALUE, SERVICE_QUESTION, SERVICE_TEXT_MAX } from "@shared/review-submission";
import {
  findReviewableProduct,
  reviewableProducts,
  submitReview,
  validateReviewForm,
  type ReviewFormInput,
} from "@/lib/reviewSubmit";
import { SUPPORT_EMAIL, mailto } from "@shared/contact-emails";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/**
 * /review and /review/:slug — public, noindex review form. Julia sends this
 * link to customers. Submissions are saved as `pending` and only appear on
 * the site after she approves them in Admin → Reviews.
 */
export default function WriteReview() {
  const params = useParams<{ slug?: string }>();
  const preselected = findReviewableProduct(params.slug);
  const products = reviewableProducts();

  const [productId, setProductId] = useState(preselected?.id ?? "");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastInitial, setLastInitial] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [serviceText, setServiceText] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const shownAt = useRef(Date.now());

  useEffect(() => {
    if (preselected) setProductId(preselected.id);
  }, [preselected?.id]);

  const product = findReviewableProduct(productId);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input: ReviewFormInput = {
      productId,
      rating,
      text,
      firstName,
      lastInitial,
      email,
      consent,
      serviceText,
      website,
      elapsedMs: Date.now() - shownAt.current,
    };
    const errs = validateReviewForm(input);
    setErrors(errs);
    setFormError("");
    if (Object.keys(errs).length) return;
    setSending(true);
    const result = await submitReview(input);
    setSending(false);
    if (result.ok) {
      setDone(true);
      window.scrollTo({ top: 0 });
    } else setFormError(result.error);
  };

  const shown = hover || rating;

  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo
        title={product ? `Review ${product.name} | Pure Fire Nutritional` : "Write a Review | Pure Fire Nutritional"}
        description="Share your experience with a Pure Fire Nutritional product."
        noindex
      />
      <Navigation />
      <main className="flex-1 bg-gray-50 py-6 sm:py-10">
        <div className="max-w-xl mx-auto px-4">
          {done ? (
            <div className="rounded-xl border border-gray-100 bg-white p-6 sm:p-8 text-center" data-testid="review-thanks">
              <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-3" aria-hidden />
              <h1 className="text-2xl font-bold text-gray-900">Thank you!</h1>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Your review{product ? ` of ${product.name}` : ""} was received. We read every review before it appears on
                the site, so it may take a few days to show up.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
                {product && (
                  <Button asChild variant="outline">
                    <Link href={`/products/${product.id}`}>Back to {product.name}</Link>
                  </Button>
                )}
                <Button asChild>
                  <Link href="/products">Continue shopping</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              noValidate
              className="rounded-xl border border-gray-100 bg-white p-5 sm:p-8 space-y-5"
              data-testid="review-form"
            >
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {product ? `Review ${product.name}` : "Write a review"}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Tell other customers about your experience. Reviews are checked before they're published.
                </p>
              </div>

              {!preselected && (
                <div>
                  <Label htmlFor="rv-product">Product</Label>
                  <select
                    id="rv-product"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-base sm:text-sm"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    aria-invalid={!!errors.productId}
                  >
                    <option value="">Choose a product…</option>
                    <option value={GENERAL_REVIEW_VALUE}>General / not product-specific</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {errors.productId && <p className="mt-1 text-xs text-red-700">{errors.productId}</p>}
                </div>
              )}

              <fieldset>
                <legend className="text-sm font-medium">Your rating</legend>
                <div className="mt-1 flex items-center gap-1" role="radiogroup" aria-label="Star rating" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={`${n} star${n === 1 ? "" : "s"}`}
                      className="p-1 -m-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                    >
                      <Star
                        className={`h-8 w-8 ${n <= shown ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-300"}`}
                        aria-hidden
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 min-w-[5rem]">{RATING_LABELS[shown]}</span>
                </div>
                {errors.rating && <p className="mt-1 text-xs text-red-700">{errors.rating}</p>}
              </fieldset>

              <div>
                <Label htmlFor="rv-text">Your review</Label>
                <Textarea
                  id="rv-text"
                  rows={5}
                  maxLength={PUBLIC_REVIEW_TEXT_MAX}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What did you notice? How long have you used it?"
                  className="mt-1 text-base sm:text-sm"
                  aria-invalid={!!errors.text}
                />
                <div className="mt-1 flex justify-between gap-2 text-xs">
                  <span className="text-red-700">{errors.text}</span>
                  <span className="text-gray-500 shrink-0">
                    {text.length}/{PUBLIC_REVIEW_TEXT_MAX}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Please describe your own experience only — we can't publish reviews that say a product cures or treats a
                  medical condition.
                </p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                <div className="col-span-2 sm:col-span-3">
                  <Label htmlFor="rv-first">First name</Label>
                  <Input
                    id="rv-first"
                    autoComplete="given-name"
                    maxLength={PUBLIC_NAME_MAX}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 text-base sm:text-sm"
                    aria-invalid={!!errors.firstName}
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-red-700">{errors.firstName}</p>}
                </div>
                <div>
                  <Label htmlFor="rv-initial">Last initial</Label>
                  <Input
                    id="rv-initial"
                    maxLength={2}
                    value={lastInitial}
                    onChange={(e) => setLastInitial(e.target.value)}
                    placeholder="D"
                    className="mt-1 text-base sm:text-sm"
                    aria-invalid={!!errors.lastInitial}
                  />
                  {errors.lastInitial && <p className="mt-1 text-xs text-red-700">{errors.lastInitial}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="rv-email">
                  Email <span className="font-normal text-gray-500">(optional, not shown)</span>
                </Label>
                <Input
                  id="rv-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 text-base sm:text-sm"
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
              </div>

              {/* Honeypot — hidden from people, filled by bots. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="rv-website">Website</label>
                <input
                  id="rv-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="rv-service">
                  {SERVICE_QUESTION} <span className="font-normal text-gray-500">(optional)</span>
                </Label>
                <Textarea
                  id="rv-service"
                  rows={3}
                  maxLength={SERVICE_TEXT_MAX}
                  value={serviceText}
                  onChange={(e) => setServiceText(e.target.value)}
                  placeholder="Ordering, shipping, questions answered…"
                  className="mt-1 text-base sm:text-sm"
                  aria-invalid={!!errors.serviceText}
                />
                <p className="mt-1 text-xs text-gray-500">Saved separately as a review of our service, never in product ratings.</p>
              </div>

              <div>
                <label className="flex items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-current"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    aria-invalid={!!errors.consent}
                    data-testid="review-consent"
                  />
                  <span>{CONSENT_LABEL}</span>
                </label>
                {errors.consent && <p className="mt-1 text-xs text-red-700">{errors.consent}</p>}
              </div>

              {formError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                  {formError}
                </p>
              )}

              <Button type="submit" className="w-full h-11" disabled={sending}>
                {sending ? "Sending…" : "Submit review"}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Your email is only used if we need to ask about your review. See our{" "}
                <Link href="/privacy" className="underline">
                  privacy policy
                </Link>
                .
              </p>
              <p className="text-xs text-gray-500 text-center">
                Need help with an order or a product? Email{" "}
                <a href={mailto(SUPPORT_EMAIL)} className="underline">
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
