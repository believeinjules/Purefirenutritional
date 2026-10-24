import { useState, type ReactNode } from "react";
import PageSeo from "@/components/seo/PageSeo";
import { faqPageJsonLd } from "@/lib/seo";
import { ChevronDown, Phone, Mail, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import PepitaAvatar from "@/components/peppy/PepitaAvatar";
import { SHIPPING_RULE_SENTENCE } from "@/lib/shippingCopy";
import { CONTACT_EMAIL, SUPPORT_EMAIL, mailto } from "@shared/contact-emails";

const EMAIL_PATTERN = /([A-Za-z0-9._%+-]+@purefirenutritional\.com)/g;

/** Renders an answer with any of our addresses turned into mailto links. */
function linkEmails(text: string): ReactNode[] {
  return text.split(EMAIL_PATTERN).map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={mailto(part)} className="text-orange-600 hover:underline">
        {part}
      </a>
    ) : (
      part
    )
  );
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  /** Optional "read more" link shown under the answer. */
  link?: { href: string; label: string };
  /** Optional extra links shown under the answer. */
  links?: { href: string; label: string }[];
}

export const CYTOMAXES_VS_CYTOGENS_HREF = "/learn/what-are-khavinson-peptide-bioregulators#cytomaxes-vs-cytogens";

export const faqs: FAQItem[] = [
  // General
  {
    category: "General",
    question: "What are peptide bioregulators?",
    answer: "Peptide bioregulators are short-chain amino acid sequences that help regulate gene expression in specific tissues. Developed through over 40 years of research by Professor Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology, these peptides work at the cellular level to support optimal organ function and promote healthy aging."
  },
  {
    category: "General",
    question: 'Are these the "Russian peptides" I\'ve heard about?',
    answer: 'The bioregulators we carry were developed by researchers associated with Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology, so they\'re sometimes called "Russian peptides" informally. They\'re short, tissue-specific peptide complexes taken orally as capsules, a different class from injectable research peptides.',
  },
  {
    category: "General",
    question: "Are these the same formulas used in the original Russian longevity studies?",
    answer: "The foundational research conducted by the St. Petersburg Institute of Bioregulation and Gerontology historically evaluated specific peptide preparations, often utilizing injectable delivery methods in clinical settings. The products we carry are oral dietary supplement capsules (such as Cytomaxes and Cytogens) meant strictly to support general wellness, tissue-specific metabolic processes, and everyday vitality. They are not intended to replicate clinical pharmaceutical protocols.",
  },
  {
    category: "General",
    question: "How is this different from other peptides people talk about?",
    answer: "These are not the peptides most people mean right now. Not GLP-1 weight-loss medications. Not injectable research peptides (BPC-157, TB-500, and the rest). Pure Fire Nutritional carries oral, short, tissue-specific Khavinson peptide bioregulators — courses, not shots. Our capsules and lingual products are dietary supplements, not clinic injectables."
  },
  {
    category: "General",
    question: "How are Khavinson peptides different from other supplements?",
    answer: "Khavinson peptides are unique because they target specific organs and tissues at the genetic level. Unlike traditional supplements that provide nutrients, peptide bioregulators help regulate the expression of genes responsible for protein synthesis in specific tissues, supporting natural regeneration and function."
  },
  {
    category: "General",
    question: "Do bioregulators need to be injected?",
    answer: "No. The bioregulators we carry are taken by mouth as capsules, and some come in liquid or under-the-tongue forms. Some related preparations were originally developed as injections in Russia, but these products are not injectables.",
  },
  {
    category: "General",
    question: "Are bioregulators FDA approved?",
    answer: "No. They are sold as dietary supplements, and the FDA does not approve supplements for effectiveness before they are sold. They are not intended to diagnose, treat, cure, or prevent any disease.",
  },
  {
    category: "General",
    question: "How do I know a product is genuine?",
    answer: `Every genuine package carries a lot number and expiry date, and ours are listed on each product page so you can match them. Pure Fire Nutritional is an authorized US retailer of Khavinson peptide bioregulators. If you have a question about a product you already bought, email ${SUPPORT_EMAIL} with the lot number and we'll help you check it.`,
    links: [{ href: "/authenticity", label: "Authenticity" }],
  },
  // Products
  {
    category: "Products",
    question: "What's the difference between Cytomaxes and Cytogens?",
    answer: "Cytomaxes are natural peptide bioregulators extracted from the organs of young animals; they contain a complex mixture of short peptides and generally work gradually, over about four to six months. Cytogens are made in a laboratory from a defined sequence of two to seven amino acids, are free from animal-derived components, and often act within one to two months. Many people use both: a Cytomax for long-term organ support and a Cytogen for more targeted support of a specific system.",
    link: { href: CYTOMAXES_VS_CYTOGENS_HREF, label: "Read more: Cytomaxes vs Cytogens" },
  },
  {
    category: "Products",
    question: "What are Revilab products?",
    answer: "Revilab products are multi-peptide complexes that combine several bioregulators for comprehensive support. The ML series are capsules for systemic support, while the SL series are sublingual drops for faster absorption. Each formula targets specific body systems."
  },
  {
    category: "Products",
    question: "Which one should I start with?",
    answer: "There's no single right starting point; it depends on what you're interested in. Our guide explains how Cytomaxes and Cytogens differ, and Pepita, our AI assistant, can help you think through the options.",
    links: [{ href: CYTOMAXES_VS_CYTOGENS_HREF, label: "Cytomaxes vs Cytogens" }, { href: "/ai-assistant?q=" + encodeURIComponent("Which bioregulator should I start with?"), label: "Ask Pepita" }],
  },
  {
    category: "Products",
    question: "Can I take multiple peptides at the same time?",
    answer: "Yes, peptide bioregulators can be taken together and often work synergistically. Many people take 2-4 different peptides targeting different organ systems. There are no known negative interactions between peptide bioregulators."
  },
  {
    category: "Products",
    question: "What's the difference between capsules and liquids?",
    answer: "Capsules are swallowed, while liquid and lingual forms are held under the tongue. Each product page lists the forms available for that product and its label directions. If the form you choose is not in stock, please allow about two extra weeks, since some products are made in Germany, Italy, or Latvia.",
  },
  // Usage
  {
    category: "Usage",
    question: "How should I take peptide bioregulators?",
    answer: "Most peptide capsules should be taken 1-2 times daily, 15-20 minutes before meals, with water. Sublingual products should be held under the tongue for 1-2 minutes before swallowing. Follow the specific instructions on each product label."
  },
  {
    category: "Usage",
    question: "How long until I see results?",
    answer: "Results vary by individual and product. Some people notice effects within 2-4 weeks, while optimal benefits typically develop over 1-3 months of consistent use. Peptide bioregulators work at the cellular level, so changes may be gradual but long-lasting."
  },
  {
    category: "Usage",
    question: "How long do people usually take them?",
    answer: "Bioregulators are usually taken as a course for a set period, then paused, rather than every day indefinitely. Each product page lists its label directions, and your doctor can help you decide what fits you.",
  },
  {
    category: "Usage",
    question: "Can I take peptides with other supplements or medications?",
    answer: "Peptide bioregulators generally do not interact with other supplements or medications. However, we always recommend consulting with your healthcare provider before starting any new supplement, especially if you take prescription medications."
  },
  // Safety
  {
    category: "Safety",
    question: "Are they safe, and who should check with a clinician first?",
    answer: "Published studies have reported few side effects, but the research is limited and no supplement is right for everyone. Check with a clinician before starting if you are pregnant or breastfeeding, under 18, take prescription medication, have a medical condition, or have surgery coming up.",
  },
  {
    category: "Safety",
    question: "Are there any side effects?",
    answer: "Side effects are rare and typically mild. Some people may experience temporary digestive discomfort when first starting. If you experience any adverse reactions, discontinue use and consult your healthcare provider."
  },
  {
    category: "Safety",
    question: "Can pregnant or nursing women take these products?",
    answer: "We recommend that pregnant or nursing women consult with their healthcare provider before taking any dietary supplements, including peptide bioregulators. Safety during pregnancy and lactation has not been specifically studied."
  },
  {
    category: "Safety",
    question: "Are your products tested for quality?",
    answer: "Yes, all our products undergo rigorous third-party testing for purity, potency, and contaminants. We only work with manufacturers who follow strict GMP guidelines and provide certificates of analysis for each batch."
  },
  // Shipping & Orders
  {
    category: "Shipping & Orders",
    question: "Do you ship internationally?",
    answer: "Yes, we ship to most countries worldwide. International shipping times vary by location, typically 7-21 business days. Please note that customers are responsible for any customs duties or import taxes in their country."
  },
  {
    category: "Shipping & Orders",
    question: "How much does shipping cost, and how long does it take?",
    answer: `${SHIPPING_RULE_SENTENCE} We aim to ship in-stock orders within 1 to 3 business days, and most U.S. orders arrive within 3 to 7 business days after they ship. If an item is not in stock, please allow about two extra weeks, since some products are made in Germany, Italy, or Latvia.`,
    links: [{ href: "/shipping", label: "Shipping Policy" }],
  },
  {
    category: "Shipping & Orders",
    question: "What is your return policy?",
    answer: `You can return unopened products within 30 days of delivery, in their original sealed packaging, for a refund of the price you paid. Opened products can't be returned unless they arrived damaged, defective or incorrect. Email ${SUPPORT_EMAIL} first to start a return; approved refunds are issued within 5 business days to the original payment method.`,
    links: [{ href: "/returns", label: "Returns & Refunds" }],
  },
  {
    category: "Shipping & Orders",
    question: "How can I track my order?",
    answer: "Once your order ships, you will receive an email with tracking information. You can also log into your account on our website to view order status and tracking details."
  },
  {
    category: "Shipping & Orders",
    question: "Do you offer wholesale or bulk pricing?",
    answer: `Yes, we offer wholesale pricing for healthcare practitioners and retailers. Please contact us at ${CONTACT_EMAIL} for wholesale inquiries and pricing information.`
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(faqs.map(f => f.category)))];
  const filteredFaqs = activeCategory === "All" ? faqs : faqs.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo
        title="Frequently Asked Questions | Pure Fire Nutritional"
        description="Get answers to common questions about Khavinson peptide bioregulators, ordering, shipping, and how our products support longevity and wellness."
        path="/faq"
        type="website"
        jsonLd={[faqPageJsonLd(faqs)]}
      />
      <Navigation />

      <main className="flex-1 bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-600 text-lg">
              Find answers to common questions about our products, peptide bioregulators, and ordering.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8 text-sm text-gray-700 space-y-2">
            <p>Ask your doctor about current medications, pregnancy, and existing conditions before use.</p>
            <p>If you have an allergic reaction, an adverse effect, or a concern, discontinue use and seek medical care.</p>
            <p>Please consult your medical doctor. These statements have not been evaluated by the FDA.</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className={activeCategory === category ? "bg-brand-gradient" : ""}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4 mb-12">
            {filteredFaqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <div>
                    <span className="text-xs text-orange-600 font-medium uppercase tracking-wide">
                      {faq.category}
                    </span>
                    <h3 className="font-semibold text-lg mt-1">{faq.question}</h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
                </button>
                {openIndex === index && (
                  <CardContent className="pt-0 pb-4 px-4">
                    <p className="text-gray-600 leading-relaxed">{linkEmails(faq.answer)}</p>
                    {[...(faq.link ? [faq.link] : []), ...(faq.links ?? [])].length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                        {[...(faq.link ? [faq.link] : []), ...(faq.links ?? [])].map((l) => (
                          <a key={l.href} href={l.href} className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:underline">
                            {l.label === "Ask Pepita" ? <PepitaAvatar size={18} /> : null}
                            {l.label} →
                          </a>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="bg-brand-gradient text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
              <p className="mb-6 opacity-90">
                Our team is here to help. Reach out to us through any of these channels.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="tel:+13155677931" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                  <Phone className="w-5 h-5" />
                  (315) 567-7931
                </a>
                <a
                  href={mailto(SUPPORT_EMAIL)}
                  aria-label={`Email us at ${SUPPORT_EMAIL}`}
                  title={SUPPORT_EMAIL}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                >
                  <Mail className="w-5 h-5" aria-hidden="true" />
                  Email Us
                </a>
                <Link href="/ai-assistant" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  AI Assistant
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
