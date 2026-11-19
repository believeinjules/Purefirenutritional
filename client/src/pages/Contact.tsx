import { Link } from "wouter";
import PageSeo from "@/components/seo/PageSeo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SUPPORT_EMAIL, mailto } from "@shared/contact-emails";
import { requirePageHead } from "@/lib/seo/publicHeads";

const h2 = "text-[11px] uppercase tracking-[0.22em] text-stone-500";
const p = "mt-4 text-base leading-relaxed text-stone-700";
const a = "underline underline-offset-2 hover:text-stone-900";

export default function Contact() {
  const head = requirePageHead("/contact");
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f3ee] text-stone-900">
      <PageSeo title={head.title} description={head.description} path="/contact" type="website" />
      <Navigation />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-24" data-testid="contact-page">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Contact</p>
          <h1 className="mt-4 font-serif text-5xl font-normal tracking-tight text-stone-900">Get in touch</h1>
          <p className="mt-6 text-base md:text-lg leading-relaxed text-stone-600">
            Questions about an order, a product, or the store? Email us, or check the FAQ. There is no contact form on this page.
          </p>

          <section className="mt-14" aria-labelledby="contact-email">
            <h2 id="contact-email" className={h2}>Email</h2>
            <p className={p}>
              The best way to reach us is{" "}
              <a href={mailto(SUPPORT_EMAIL)} className={a} data-testid="contact-support-email">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section className="mt-10" aria-labelledby="contact-faq">
            <h2 id="contact-faq" className={h2}>FAQ</h2>
            <p className={p}>
              Many common questions about orders, shipping, and products are answered on our{" "}
              <Link href="/faq" className={a} data-testid="contact-faq-link">
                frequently asked questions
              </Link>{" "}
              page.
            </p>
          </section>

          <section className="mt-10" aria-labelledby="contact-also">
            <h2 id="contact-also" className={h2}>Also</h2>
            <ul className={`${p} list-none space-y-2`}>
              <li>
                Phone:{" "}
                <a href="tel:+13155677931" className={a}>
                  (315) 567-7931
                </a>
              </li>
              <li>Brooklyn, NY</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
