/**
 * Mailing-list signup request, shared by the homepage inline Subscribe strip.
 * Same endpoint and payload as the footer form: POST /api/mailing-list/subscribe { email }.
 */
export type SubscribeResult =
  | { status: "subscribed" }
  | { status: "already" }
  | { status: "error"; message: string };

export const EMAIL_PATTERN = /\S+@\S+\.\S+/;

export async function subscribeToMailingList(email: string): Promise<SubscribeResult> {
  try {
    const response = await fetch("/api/mailing-list/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      return data.alreadySubscribed ? { status: "already" } : { status: "subscribed" };
    }
    return { status: "error", message: data.error || "Failed to subscribe. Please try again." };
  } catch {
    return { status: "error", message: "Failed to subscribe. Please try again." };
  }
}
