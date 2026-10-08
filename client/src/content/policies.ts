/**
 * Copy for the store policy pages: /privacy, /terms, /shipping, /returns.
 *
 * Facts come from the code, not from memory:
 *   - shipping rate + free-shipping threshold: shared/commerce-config.ts (via lib/shippingCopy)
 *   - countries checkout accepts: api/_lib/checkout-session.ts (shipping_address_collection);
 *     policy-pages.test.ts fails if the two lists drift apart
 *   - data collected: Firebase Auth + `profiles` (Signup), Stripe Checkout + `orders` /
 *     `customers` (webhook), `mailing_list`, `customer_wishlist`, `reviews`, Google Analytics
 *   - "Orders ship from the US … Germany, Italy, or Latvia": the approved cart/checkout/FAQ copy
 *   - 30-day unopened returns: the existing FAQ answer
 *
 * Policy decisions that were NOT in the repo (processing time, carriers, damage-report
 * window, refund timing, governing law, …) use conservative standard wording and are listed
 * under "Needs Julia's confirmation" in the PR that added these pages.
 *
 * Inline links: write [label](/path), [label](https://…) or [label](mailto:…).
 */
import {
  FREE_SHIPPING_THRESHOLD_LABEL,
  SHIPPING_RULE_SENTENCE,
  STANDARD_SHIPPING_LABEL,
} from "@/lib/shippingCopy";

export const POLICY_LAST_UPDATED = "October 8, 2026";
/** The contact address shown in the site footer and FAQ. */
export const CONTACT_EMAIL = "info@purefirenutritional.com";
const EMAIL_LINK = `[${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})`;

/** Countries Stripe Checkout accepts as a ship-to address (must match checkout-session.ts). */
export const SHIP_TO_COUNTRIES: Array<{ code: string; name: string }> = [
  { code: "US", name: "the United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "the United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "IE", name: "Ireland" },
];

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Standard FDA dietary-supplement disclaimer (21 CFR 101.93). */
export const FDA_DISCLAIMER =
  "These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease.";

export type PolicyBlock = string | { list: string[] } | { callout: string };
export type PolicySection = { heading: string; body: PolicyBlock[] };
export type PolicyKey = "privacy" | "terms" | "shipping" | "returns";
export type Policy = {
  key: PolicyKey;
  path: string;
  /** H1 and the label used in "Related policies" links. */
  title: string;
  /** <title> */
  metaTitle: string;
  /** Meta description (≤160 characters). */
  description: string;
  intro: string;
  /** Short "at a glance" facts shown in a box under the intro. */
  summary?: string[];
  sections: PolicySection[];
};

const SITE = "purefirenutritional.com";

// ─── Privacy Policy ───────────────────────────────────────────────────────────

const privacy: Policy = {
  key: "privacy",
  path: "/privacy",
  title: "Privacy Policy",
  metaTitle: "Privacy Policy | Pure Fire Nutritional",
  description:
    "How Pure Fire Nutritional collects, uses and protects your information when you shop, create an account or join our mailing list.",
  intro: `This Privacy Policy explains what information Pure Fire Nutritional ("Pure Fire," "we," "us") collects when you visit ${SITE}, create an account, place an order or join our mailing list, how we use that information, and the choices you have.`,
  sections: [
    {
      heading: "Information you give us",
      body: [
        {
          list: [
            "Account details: your full name, email address, birthday and a password when you create an account. Passwords are handled by Google Firebase Authentication. We never see or store your password.",
            "Order details: your name, email address, shipping address and billing address, entered on our secure checkout page hosted by Stripe. Card details go directly to Stripe. We do not receive or store your full card number.",
            "Mailing list: your email address when you subscribe to our newsletter.",
            "Wishlist: the products you save, and whether you would like to hear about sales or restocks of those products.",
            "Reviews: if you send us a review and give us permission to publish it, we keep your first name, last initial, star rating, review text and whether you bought the product from us.",
            "Messages: anything you send us by email, such as a question about an order.",
            "AI Assistant: the questions you type into our AI Assistant, which it uses to suggest products. Please do not enter personal health details you would not want stored.",
          ],
        },
      ],
    },
    {
      heading: "Information collected automatically",
      body: [
        {
          list: [
            "Analytics: we use Google Analytics to understand how visitors use the site, for example which pages are viewed and how visitors found us. Google Analytics uses cookies and receives information such as your IP address, device and browser type, and the pages you visit.",
            "Browser storage: your cart, your wishlist (when you are not signed in) and your display preference are saved in your browser so they are still there when you come back. Firebase Authentication also stores sign-in information in your browser to keep you signed in.",
            "Technical logs: our hosting, payment and database providers record technical information such as IP address, browser type and request times so they can run and secure the service.",
            "Fonts: the site loads fonts from Google Fonts, which receives your IP address when your browser requests the font files.",
          ],
        },
      ],
    },
    {
      heading: "How we use your information",
      body: [
        {
          list: [
            "To process, pack and ship your orders, and to send order confirmations and shipping updates with tracking.",
            "To calculate sales tax, which our payment provider works out from your address at checkout.",
            "To run your account, including your order history and wishlist.",
            "To answer your questions and provide customer support.",
            "To send our newsletter if you subscribed, and sale or restock notices for wishlist items if you asked for them.",
            "To publish reviews you have given us permission to publish.",
            "To understand how the site is used and improve it.",
            "To prevent fraud, keep the site secure, and meet our legal, tax and accounting obligations.",
          ],
        },
      ],
    },
    {
      heading: "How we share your information",
      body: [
        "We do not sell your personal information, and we do not rent or trade our customer lists. We share information only with companies that help us run the store, and only as needed for that work:",
        {
          list: [
            "Stripe, for payments, fraud prevention and sales tax calculation.",
            "Google Firebase, for account sign-in and for the database that stores accounts, orders, wishlists, mailing-list sign-ups and reviews.",
            "Vercel, which hosts the website.",
            "Google Analytics, for site analytics.",
            "Email service providers, which deliver order confirmations, account verification emails and our newsletter.",
            "Shipping carriers, which receive your name and shipping address to deliver your order.",
          ],
        },
        "We may also disclose information when the law requires it, to protect the rights, property or safety of Pure Fire, our customers or others, or as part of a sale or transfer of our business.",
      ],
    },
    {
      heading: "Cookies and your choices",
      body: [
        "You can block or delete cookies in your browser settings. Your cart and sign-in may not work as expected if you block browser storage for our site.",
        "To stop Google Analytics from collecting data about your visits, you can install the [Google Analytics opt-out browser add-on](https://tools.google.com/dlpage/gaoptout).",
        "Our site does not currently respond to browser Do Not Track signals.",
      ],
    },
    {
      heading: "Emails from us",
      body: [
        `You can unsubscribe from our newsletter at any time by emailing ${EMAIL_LINK}. Even if you unsubscribe, we will still send emails about orders you place, such as confirmations and shipping updates.`,
      ],
    },
    {
      heading: "Your rights",
      body: [
        `You can ask us to give you a copy of the personal information we hold about you, to correct it, or to delete it, including your account. Email ${EMAIL_LINK} from the address linked to your account or order. We may need to confirm your identity before we act on a request, and we will respond within the time required by applicable law.`,
        "Depending on the state or country you live in, you may have additional privacy rights. We will not treat you differently for exercising any of them. We may keep records we are required to keep, such as order and tax records, even after you ask us to delete your information.",
      ],
    },
    {
      heading: "How long we keep information",
      body: [
        "We keep account information while your account is open. We keep order records for as long as we need them for accounting, tax and legal purposes. If you unsubscribe from our newsletter, we keep a record of your email address marked as unsubscribed so that we do not email you again.",
      ],
    },
    {
      heading: "Security",
      body: [
        "Our site is served over an encrypted (HTTPS) connection. Payments are processed by Stripe, and only authorized Pure Fire staff can sign in to see order information. No website or online service can be guaranteed to be completely secure, so please use a strong, unique password for your account.",
      ],
    },
    {
      heading: "Children",
      body: [
        `Our site and products are intended for adults. We do not knowingly collect personal information from children under 13. If you believe a child has given us personal information, please email ${EMAIL_LINK} and we will delete it.`,
      ],
    },
    {
      heading: "Where your information is processed",
      body: [
        "Pure Fire Nutritional is based in the United States. Our service providers may store and process information in the United States and in other countries.",
      ],
    },
    {
      heading: "Changes to this policy",
      body: [
        'If we change this policy, we will post the new version on this page and update the "Last updated" date above. If a change materially affects how we use information we already hold, we will tell you by email or with a notice on the site.',
      ],
    },
    {
      heading: "Contact us",
      body: [`Questions about this policy or your information: ${EMAIL_LINK}.`],
    },
  ],
};

// ─── Terms of Service ─────────────────────────────────────────────────────────

const terms: Policy = {
  key: "terms",
  path: "/terms",
  title: "Terms of Service",
  metaTitle: "Terms of Service | Pure Fire Nutritional",
  description:
    "The terms for using purefirenutritional.com and buying from Pure Fire Nutritional: orders, pricing, product information and disclaimers.",
  intro: `These Terms of Service ("Terms") apply when you use ${SITE} or buy products from Pure Fire Nutritional ("Pure Fire," "we," "us"). By using the site or placing an order, you agree to these Terms. Please read them carefully.`,
  sections: [
    {
      heading: "Other policies that apply",
      body: [
        "Our [Privacy Policy](/privacy), [Shipping Policy](/shipping) and [Returns & Refunds](/returns) policy are part of these Terms.",
      ],
    },
    {
      heading: "Eligibility and personal use",
      body: [
        `You must be at least 18 years old to buy from us. Products are sold for your personal use and not for resale. For wholesale inquiries, email ${EMAIL_LINK}.`,
      ],
    },
    {
      heading: "Dietary supplements and health information",
      body: [
        "The products we sell are dietary supplements.",
        { callout: FDA_DISCLAIMER },
        "Information on this site, including product pages, the Science and Learn pages, the FAQ and the AI Assistant, is for general education only. It is not medical advice and is not a substitute for advice from a qualified healthcare professional. References to published research describe that research. They are not a promise of any particular result for you.",
        "Talk to your healthcare provider before using any supplement, especially if you are pregnant or nursing, have a medical condition, or take medication. Follow the directions on the label. Stop using a product and seek medical care if you have an adverse reaction. Keep all supplements out of reach of children.",
      ],
    },
    {
      heading: "AI Assistant",
      body: [
        "The AI Assistant is an automated tool that suggests products based on what you type. Its answers can be incomplete or wrong, and they are not medical advice. Do not rely on it to make health decisions.",
      ],
    },
    {
      heading: "Your account",
      body: [
        "Please give accurate information when you create an account and keep your password private. You are responsible for activity under your account. We may suspend or close accounts that break these Terms.",
      ],
    },
    {
      heading: "Products, prices and availability",
      body: [
        "We work to describe and photograph products accurately. Packaging and labels may differ slightly from the images on the site.",
        "Prices are in U.S. dollars and may change at any time. The price shown at checkout when you place your order is the price you pay. Bundle discounts and promotion codes apply only as shown at checkout.",
        "If a product is listed with the wrong price or wrong information, we may cancel orders for that product, even after we have confirmed them, and refund you in full. We may limit quantities, and we may discontinue any product.",
      ],
    },
    {
      heading: "Orders and payment",
      body: [
        "Placing an order is an offer to buy. The confirmation email we send means we received your order, not that we have accepted it. We accept your order when we ship it. We may decline or cancel any order, for example if a product is unavailable, we suspect fraud, or we cannot ship to the address given. If we cancel an order you have paid for, we refund the full amount.",
        "Payment is by card through our payment provider, Stripe. By placing an order, you authorize us to charge the order total, including shipping and any applicable sales tax. Sales tax is calculated at checkout from your shipping address.",
      ],
    },
    {
      heading: "Shipping, risk of loss and returns",
      body: [
        "Shipping is described in our [Shipping Policy](/shipping) and returns in our [Returns & Refunds](/returns) policy. Title and risk of loss pass to you when we hand your order to the carrier. This does not limit the help described in our Shipping Policy for packages that are lost or arrive damaged.",
        "For orders shipped outside the United States, you are the importer. You are responsible for any customs duties, import taxes and fees, and for making sure the products may be lawfully imported where you live.",
      ],
    },
    {
      heading: "Reviews and other submissions",
      body: [
        "If you send us a review and give permission to publish it, you allow us to show it on our site with your first name and last initial. We do not publish reviews that describe a product as treating or curing a condition, and we may decline to publish any review. Please send only content that is your own and that is truthful.",
      ],
    },
    {
      heading: "Intellectual property",
      body: [
        "The content of this site, including text, graphics, logos and page design, belongs to Pure Fire Nutritional or its licensors. Product names and trademarks belong to their respective owners. You may view and print pages for your personal, non-commercial use. Any other copying or reuse requires our written permission.",
      ],
    },
    {
      heading: "Acceptable use",
      body: [
        {
          list: [
            "Do not use the site for anything unlawful or to place fraudulent orders.",
            "Do not try to gain unauthorized access to the site, other accounts or our systems, or interfere with how the site works.",
            "Do not copy large parts of the site or collect data from it with automated tools without our written permission.",
          ],
        },
      ],
    },
    {
      heading: "Links to other sites",
      body: [
        "The site links to other websites, such as published research and certificates. We do not control those sites and are not responsible for their content or privacy practices.",
      ],
    },
    {
      heading: "Disclaimer of warranties",
      body: [
        'To the fullest extent the law allows, the site and its content are provided "as is" and "as available," without warranties of any kind beyond those stated in these Terms. This does not affect any rights you have that cannot be waived under applicable law.',
      ],
    },
    {
      heading: "Limitation of liability",
      body: [
        "To the fullest extent the law allows, Pure Fire Nutritional will not be liable for any indirect, incidental, special or consequential damages arising from your use of the site or our products. Our total liability for any claim relating to an order is limited to the amount you paid for the product that the claim is about. Some states do not allow these limits, so they may not apply to you.",
      ],
    },
    {
      heading: "Indemnification",
      body: [
        "You agree to cover any claims, losses and reasonable costs, including legal fees, that result from your breaking these Terms or misusing the site.",
      ],
    },
    {
      heading: "Governing law",
      body: [
        "These Terms are governed by the laws of the State of New York, without regard to its conflict-of-law rules. Any dispute will be heard in the state or federal courts located in New York, unless the law where you live requires otherwise.",
      ],
    },
    {
      heading: "Changes to these Terms",
      body: [
        'We may update these Terms from time to time. The new version applies from the "Last updated" date shown above. Orders already placed are covered by the Terms in effect when you placed them.',
      ],
    },
    {
      heading: "Contact us",
      body: [`Questions about these Terms: ${EMAIL_LINK}.`],
    },
  ],
};

// ─── Shipping Policy ──────────────────────────────────────────────────────────

const countries = joinList(SHIP_TO_COUNTRIES.map((c) => c.name));
const internationalCountries = joinList(SHIP_TO_COUNTRIES.filter((c) => c.code !== "US").map((c) => c.name));

const shipping: Policy = {
  key: "shipping",
  path: "/shipping",
  title: "Shipping Policy",
  metaTitle: "Shipping Policy | Pure Fire Nutritional",
  description: `Shipping is ${STANDARD_SHIPPING_LABEL}, free on orders of ${FREE_SHIPPING_THRESHOLD_LABEL} or more. Processing times, tracking, international orders and lost packages.`,
  intro: "Here is how shipping works when you order from Pure Fire Nutritional.",
  summary: [
    `${STANDARD_SHIPPING_LABEL} flat-rate shipping.`,
    `Free shipping on orders of ${FREE_SHIPPING_THRESHOLD_LABEL} or more.`,
    "Orders ship from the US.",
    "Tracking number by email when your order ships.",
  ],
  sections: [
    {
      heading: "Shipping cost",
      body: [
        SHIPPING_RULE_SENTENCE,
        "The merchandise subtotal is the cost of the products in your cart after any bundle discounts, before promotion codes and sales tax. The same shipping charge applies to every country we ship to. You will see the shipping charge in your cart and at checkout before you pay.",
      ],
    },
    {
      heading: "Processing time",
      body: [
        "We aim to ship in-stock orders within 1 to 3 business days (Monday to Friday, excluding U.S. federal holidays).",
        "Orders ship from the US. If an item is not in stock, please allow about two extra weeks, since some products are made in Germany, Italy, or Latvia. If an item will take longer than that, we will email you and you can choose to wait or cancel that item for a refund.",
      ],
    },
    {
      heading: "Delivery in the United States",
      body: [
        "We ship with major carriers such as USPS, UPS and FedEx. Most U.S. orders arrive within 3 to 7 business days after they ship. Delivery times are estimates from the carrier and are not guaranteed, particularly during holidays and severe weather.",
      ],
    },
    {
      heading: "Tracking your order",
      body: [
        "When your order ships, we email you a tracking number. If you have an account, you can also sign in to [My Account](/dashboard) to see your order status.",
      ],
    },
    {
      heading: "Where we ship",
      body: [`Checkout currently accepts shipping addresses in ${countries}.`],
    },
    {
      heading: "International orders",
      body: [
        `For orders to ${internationalCountries}, delivery usually takes 7 to 21 business days after shipment, depending on the destination and customs.`,
        {
          list: [
            "Customs duties, import taxes and brokerage fees are not included in our prices or shipping charge. They are the recipient's responsibility.",
            "Customs may hold or inspect packages, which can add time to delivery.",
            "Rules for importing dietary supplements vary by country. Please check that the products you order may be imported where you live.",
            "If a package is refused, returned or held by customs, we refund the products once the package comes back to us. Shipping charges and any duties or taxes already paid are not refundable.",
          ],
        },
      ],
    },
    {
      heading: "Address changes and undeliverable packages",
      body: [
        `Please check your shipping address carefully at checkout. If you need to change it, email ${EMAIL_LINK} as soon as possible. We cannot change the address after your order has shipped.`,
        "If a package is returned to us because the address was incorrect or it was not collected, we can send it again for another shipping charge, or refund the products.",
      ],
    },
    {
      heading: "Lost, late or damaged packages",
      body: [
        `If tracking shows your package as delivered but you cannot find it, please check around your delivery location and with neighbors, then email ${EMAIL_LINK} within 7 days of the delivery date shown in tracking. If tracking has not updated for 10 business days, let us know. We will work with the carrier and, if the package is confirmed lost, send a replacement or refund your order.`,
        "If your order arrives damaged, see [Returns & Refunds](/returns) for how to report it.",
      ],
    },
    {
      heading: "Questions",
      body: [`Email ${EMAIL_LINK} with your order number and we will help.`],
    },
  ],
};

// ─── Returns & Refunds ────────────────────────────────────────────────────────

const returns: Policy = {
  key: "returns",
  path: "/returns",
  title: "Returns & Refunds",
  metaTitle: "Returns & Refunds | Pure Fire Nutritional",
  description:
    "Return unopened, sealed products within 30 days of delivery. How to start a return, damaged or incorrect items, refunds and cancellations.",
  intro: "We want you to be happy with your order. Here is how returns, refunds and cancellations work.",
  summary: [
    "Unopened, sealed products can be returned within 30 days of delivery.",
    "Opened products cannot be returned unless they arrived damaged, defective or incorrect.",
    "Email us first to start a return.",
  ],
  sections: [
    {
      heading: "Unopened products",
      body: [
        "You may return unopened products in their original, sealed packaging within 30 days of delivery for a refund of the price you paid.",
      ],
    },
    {
      heading: "Opened products",
      body: [
        "For safety and hygiene reasons, we cannot accept returns of products that have been opened or whose seal is broken, unless the product arrived damaged, defective or was not what you ordered.",
      ],
    },
    {
      heading: "Damaged, defective or incorrect items",
      body: [
        `If an item arrives damaged, defective or is not what you ordered, email ${EMAIL_LINK} within 7 days of delivery. Include your order number and photos of the item and its packaging. We will send a replacement or give you a full refund for that item, including any shipping you paid for it. If we need the item back, we will pay for the return shipping.`,
      ],
    },
    {
      heading: "How to start a return",
      body: [
        {
          list: [
            `Email ${EMAIL_LINK} with your order number, the items you want to return and the reason.`,
            "We will reply with return instructions and the address to send your return to.",
            "Pack the items securely and use a shipping service with tracking. We cannot be responsible for returns lost on the way to us.",
          ],
        },
        "Please do not send items back without contacting us first. Returns sent without instructions from us may not be processed.",
      ],
    },
    {
      heading: "Return shipping costs",
      body: [
        "For unopened products you return for any reason other than our mistake, you pay the return shipping, and the original shipping charge is not refunded. If the return is because of our mistake, such as a damaged, defective or incorrect item, we pay the shipping.",
      ],
    },
    {
      heading: "Refunds",
      body: [
        "We inspect returns when they arrive and issue approved refunds within 5 business days, to the original payment method. Your bank or card issuer may take another 5 to 10 business days to show the refund.",
        "The refund is the price you paid for each returned item, after any bundle discount or promotion code, plus the sales tax charged on it. If you return part of a bundle, each returned bottle is refunded at the per-bottle bundle price you paid.",
      ],
    },
    {
      heading: "Cancellations and changes",
      body: [
        `To cancel or change an order, email ${EMAIL_LINK} as soon as possible. If your order has not shipped yet, we will cancel it and refund the full amount, including shipping and tax. Once an order has shipped, it can no longer be cancelled, and this returns policy applies.`,
      ],
    },
    {
      heading: "Exchanges",
      body: [
        "We do not offer direct exchanges. If you would like a different product or size, return the unopened item for a refund and place a new order.",
      ],
    },
    {
      heading: "International returns",
      body: [
        "Returns from outside the United States follow the same rules. Return shipping, and any duties or taxes paid when the order was imported, are not refundable by us, except when the return is because of our mistake.",
      ],
    },
    {
      heading: "Questions",
      body: [`Email ${EMAIL_LINK} with your order number and we will help.`],
    },
  ],
};

export const POLICIES: Record<PolicyKey, Policy> = { privacy, terms, shipping, returns };
export const POLICY_LIST: Policy[] = [privacy, terms, shipping, returns];
export const POLICY_PATHS: string[] = POLICY_LIST.map((p) => p.path);

