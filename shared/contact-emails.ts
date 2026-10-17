/**
 * Public contact addresses shown on the site and in customer emails.
 *
 *  - SUPPORT_EMAIL: orders, shipping, returns, checkout, accounts and product questions.
 *  - CONTACT_EMAIL: general inquiries, privacy/terms questions, press, partnerships, wholesale.
 *  - FOUNDER_EMAIL: founder-direct. Use only in the About page founder section; do not show sitewide.
 *
 * Admin allowlists (ADMIN_EMAILS, Firestore/Storage rules) are separate and must not use these.
 */
export const SUPPORT_EMAIL = "support@purefirenutritional.com";
export const CONTACT_EMAIL = "contact@purefirenutritional.com";
export const FOUNDER_EMAIL = "julia@purefirenutritional.com";

export const mailto = (email: string) => `mailto:${email}`;
