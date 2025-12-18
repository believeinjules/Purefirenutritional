import { useState } from "react";
import { ChevronDown, Phone, Mail, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "wouter";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // General
  {
    category: "General",
    question: "What are peptide bioregulators?",
    answer: "Peptide bioregulators are short-chain amino acid sequences that help regulate gene expression in specific tissues. Developed through over 40 years of research by Professor Vladimir Khavinson, these peptides work at the cellular level to support optimal organ function and promote healthy aging."
  },
  {
    category: "General",
    question: "How are Khavinson peptides different from other supplements?",
    answer: "Khavinson peptides are unique because they target specific organs and tissues at the genetic level. Unlike traditional supplements that provide nutrients, peptide bioregulators help regulate the expression of genes responsible for protein synthesis in specific tissues, supporting natural regeneration and function."
  },
  {
    category: "General",
    question: "Are your products FDA approved?",
    answer: "Our products are dietary supplements and are manufactured in FDA-registered facilities following Good Manufacturing Practices (GMP). As dietary supplements, they are not intended to diagnose, treat, cure, or prevent any disease. The FDA does not approve dietary supplements in the same way it approves drugs."
  },
  {
    category: "General",
    question: "Is Pure Fire Nutritional an authorized Khavinson retailer?",
    answer: "Yes, Pure Fire Nutritional is the exclusive authorized retailer of authentic Khavinson peptide bioregulators in the United States. We source directly from verified manufacturers to ensure authenticity and quality."
  },
  // Products
  {
    category: "Products",
    question: "What is the difference between Cytomaxes and Cytogens?",
    answer: "Cytomaxes are natural peptide bioregulators derived from animal tissues, while Cytogens are synthetic peptides created in the laboratory. Both have similar effects, but Cytogens offer higher purity and consistency. Cytogens are ideal for those who prefer non-animal-derived products."
  },
  {
    category: "Products",
    question: "What are Revilab products?",
    answer: "Revilab products are multi-peptide complexes that combine several bioregulators for comprehensive support. The ML series are capsules for systemic support, while the SL series are sublingual drops for faster absorption. Each formula targets specific body systems."
  },
  {
    category: "Products",
    question: "Which peptide should I start with?",
    answer: "For general wellness and anti-aging, we recommend starting with Endoluten (pineal gland) and Vladonix (thymus/immune). For specific concerns, choose peptides targeting those organs. Our AI Assistant can help recommend products based on your individual needs."
  },
  {
    category: "Products",
    question: "Can I take multiple peptides at the same time?",
    answer: "Yes, peptide bioregulators can be taken together and often work synergistically. Many people take 2-4 different peptides targeting different organ systems. There are no known negative interactions between peptide bioregulators."
  },
  {
    category: "Products",
    question: "What is the difference between lingual and capsule forms?",
    answer: "Lingual (sublingual) products are absorbed directly through the mucous membranes under the tongue, providing faster absorption and higher bioavailability. Capsule forms pass through the digestive system. Both are effective; sublingual may be preferred for quicker results."
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
    question: "Should I take peptides continuously or in cycles?",
    answer: "The traditional protocol is to take peptides for 10-30 days, then take a break of 3-6 months before repeating. However, many practitioners recommend continuous low-dose supplementation for ongoing support. Consult with a healthcare provider for personalized advice."
  },
  {
    category: "Usage",
    question: "Can I take peptides with other supplements or medications?",
    answer: "Peptide bioregulators generally do not interact with other supplements or medications. However, we always recommend consulting with your healthcare provider before starting any new supplement, especially if you take prescription medications."
  },
  // Safety
  {
    category: "Safety",
    question: "Are peptide bioregulators safe?",
    answer: "Peptide bioregulators have been used safely for over 40 years in Russia and have been the subject of numerous clinical studies. They are generally well-tolerated with no known serious side effects. As with any supplement, individual responses may vary."
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
    question: "How long does shipping take within the US?",
    answer: "Standard US shipping typically takes 3-7 business days. Expedited shipping options are available at checkout for faster delivery. All orders are processed within 1-2 business days."
  },
  {
    category: "Shipping & Orders",
    question: "What is your return policy?",
    answer: "We offer a 30-day satisfaction guarantee. If you're not completely satisfied with your purchase, you may return unopened products within 30 days for a full refund. Please contact our customer service team to initiate a return."
  },
  {
    category: "Shipping & Orders",
    question: "How can I track my order?",
    answer: "Once your order ships, you will receive an email with tracking information. You can also log into your account on our website to view order status and tracking details."
  },
  {
    category: "Shipping & Orders",
    question: "Do you offer wholesale or bulk pricing?",
    answer: "Yes, we offer wholesale pricing for healthcare practitioners and retailers. Please contact us at info@purefirenutritional.com for wholesale inquiries and pricing information."
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(faqs.map(f => f.category)))];
  const filteredFaqs = activeCategory === "All" ? faqs : faqs.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
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

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className={activeCategory === category ? "bg-gradient-to-r from-orange-500 to-rose-500" : ""}
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
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="bg-gradient-to-r from-orange-500 to-rose-500 text-white">
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
                <a href="mailto:info@purefirenutritional.com" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                  <Mail className="w-5 h-5" />
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
