import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Brain,
  Heart,
  Sparkles,
  Shield,
  FlaskConical,
  Activity,
  Leaf,
  ChevronRight,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";

// ─── Wellness category data ───────────────────────────────────────────────────

const wellnessCategories = [
  {
    icon: Brain,
    color: "bg-indigo-50 text-indigo-600",
    border: "hover:border-indigo-300",
    title: "Brain & Cognitive Vitality",
    description:
      "The brain is the body's most adaptive organ — constantly rewiring, responding, and recovering. These formulas support memory, focus, neuroplasticity, and mental clarity across every stage of life.",
    products: ["Cerluten", "Pinealon", "Prime Peptide Brain", "Revilab ML 03", "Revilab SL 02"],
    href: "/products?category=PEPTIDE+BIOREGULATORS",
    cta: "Explore Cognitive Support",
  },
  {
    icon: Activity,
    color: "bg-rose-50 text-rose-600",
    border: "hover:border-rose-300",
    title: "Recovery & Resilience",
    description:
      "Resilience is not the absence of stress — it's the capacity to return to balance. These tools support the body's natural recovery systems: muscle, cardiovascular, immune, and nervous system.",
    products: ["Gotratix", "Chelohart", "Revilab ML 04", "Revilab SL 07", "Chondromix"],
    href: "/products",
    cta: "Explore Recovery Tools",
  },
  {
    icon: Sparkles,
    color: "bg-purple-50 text-purple-600",
    border: "hover:border-purple-300",
    title: "Longevity & Healthy Aging",
    description:
      "Aging is a process — not a destination. Evidence-informed approaches to cellular health, antioxidant defense, and metabolic balance can meaningfully support how we age from the inside out.",
    products: ["Endoluten", "Revilab Anti-A.G.E.", "Spermidine Longevity", "GPL Man", "GPL Femme"],
    href: "/products?category=ANTI+AGING-LONGEVITY",
    cta: "Explore Longevity",
  },
  {
    icon: Shield,
    color: "bg-emerald-50 text-emerald-600",
    border: "hover:border-emerald-300",
    title: "Organ & Foundational Support",
    description:
      "Every system in the body depends on the health of its underlying organs. Targeted peptide bioregulators work at the cellular level to support the liver, kidneys, thyroid, immune system, and more.",
    products: ["Vladonix", "Svetinorm", "Thyreogen", "Pielotax", "Revilab ML 06"],
    href: "/products?category=PEPTIDE+BIOREGULATORS",
    cta: "Explore Foundational Support",
  },
];

// ─── Philosophy pillars ───────────────────────────────────────────────────────

const pillars = [
  {
    icon: Brain,
    label: "Neuroplasticity",
    text: "The brain retains the capacity to adapt and reorganize throughout life. Supporting this process is central to cognitive vitality.",
  },
  {
    icon: Activity,
    label: "Stress & Recovery",
    text: "Resilience is built in the recovery phase. The nervous system, immune system, and cellular repair all depend on adequate recovery support.",
  },
  {
    icon: Heart,
    label: "Whole-Person Wellness",
    text: "Mental clarity and physical vitality are not separate. They are expressions of the same underlying biological balance.",
  },
  {
    icon: Leaf,
    label: "Informed Choices",
    text: "We believe wellness begins with understanding. Empowered decisions come from access to honest, evidence-grounded information.",
  },
];

// ─── Trust signals ────────────────────────────────────────────────────────────

const trustSignals = [
  { stat: "40+", label: "Years of Research", sub: "St. Petersburg Institute of Bioregulation" },
  { stat: "200+", label: "Clinical Studies", sub: "Peer-reviewed publications" },
  { stat: "15M+", label: "Patients Supported", sub: "Across clinical applications" },
  { stat: "100+", label: "Patents Worldwide", sub: "Khavinson peptide bioregulators" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Index() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email"); return; }
    setIsSubscribing(true);
    try {
      const response = await fetch("/api/mailing-list/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) { toast.error(data.error || "Failed to subscribe"); return; }
      toast.success("You're in. Welcome to the community.");
      setEmail("");
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>Khavinson Peptide Bioregulators & Longevity Supplements | Pure Fire Nutritional</title>
        <meta name="description" content="Pure Fire Nutritional is the exclusive US retailer of Khavinson peptide bioregulators. Shop Cytomaxes, Cytogens, anti-aging supplements, and longevity solutions backed by 40+ years of research." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Pure Fire Nutritional",
          "url": "https://www.purefirenutritional.com",
          "logo": "https://www.purefirenutritional.com/logo-flame.jpeg",
          "telephone": "(315) 567-7931",
          "email": "info@purefirenutritional.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "505 Brighton Beach Ave 2nd FL",
            "addressLocality": "Brooklyn",
            "addressRegion": "NY",
            "postalCode": "11234",
            "addressCountry": "US"
          }
        })}</script>
      </Helmet>
      <Navigation />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#0d0d0d", padding: "72px 24px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>

          {/* Badge */}
          <div style={{
            display: "inline-block",
            marginBottom: "32px",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "10px",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#E8622A",
          }}>
            Premium Health &amp; Longevity
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
            fontSize: "clamp(44px, 6vw, 66px)",
            color: "white",
            lineHeight: 1.0,
            marginBottom: "28px",
          }}>
            Support the Mind and Body's Natural Capacity to{" "}
            <span style={{
              fontStyle: "italic",
              fontWeight: 300,
              background: "linear-gradient(135deg, #E8793A, #E06050, #CC4472, #B83870)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Recover, Adapt, and Thrive.
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: "13px",
            color: "#666",
            lineHeight: 1.85,
            maxWidth: "400px",
            margin: "0 auto 36px",
          }}>
            Evidence-informed wellness tools designed to support cognitive vitality, resilience, healthy aging, recovery, and whole-person wellness.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products">
              <a className="btn-primary">
                Explore Wellness Tools
              </a>
            </Link>
            <Link href="/about">
              <a className="btn-secondary">
                Learn the Philosophy
              </a>
            </Link>
          </div>

          {/* Stats row */}
          <div style={{
            marginTop: "60px",
            borderTop: "0.5px solid #222",
            paddingTop: "36px",
            display: "flex",
            justifyContent: "center",
            alignItems: "stretch",
          }}>
            {[
              { value: "US", label: "Exclusive Retailer" },
              { value: "40+", label: "Years of Research" },
              { value: "Sci.", label: "Validated" },
            ].map((stat, i) => (
              <div key={stat.label} style={{ display: "flex", alignItems: "stretch" }}>
                {i > 0 && (
                  <div style={{ width: "0.5px", backgroundColor: "#2a2a2a", margin: "0 40px" }} />
                )}
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 600,
                    fontSize: "28px",
                    color: "white",
                    lineHeight: 1,
                    marginBottom: "8px",
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: "9px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#555",
                  }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Philosophy ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="section-label mb-4">Our Approach</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-snug">
            Wellness begins with understanding.
          </h2>
          <div className="space-y-5 text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
            <p>
              The body and mind are adaptive systems — constantly responding to environment, stress, recovery, behavior, and awareness. Our goal is not simply to offer products, but to support informed, empowered approaches to cognitive vitality, resilience, longevity, and whole-person wellness.
            </p>
            <p className="text-gray-800 font-medium italic">
              "Because some perspectives create limitation. Others create possibility."
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14">
            {pillars.map(({ icon: Icon, label, text }) => (
              <div key={label} className="text-left">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-orange-600" />
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{label}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Wellness Categories ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Wellness Tools</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Guided by System. Grounded in Science.
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Rather than browsing by product type, explore by what your body and mind need most right now.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {wellnessCategories.map(({ icon: Icon, color, border, title, description, products, href, cta }) => (
              <div key={title} className={`bg-white rounded-2xl border border-gray-100 p-7 transition-all duration-200 hover:shadow-md ${border}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{description}</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {products.map((p) => (
                    <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{p}</span>
                  ))}
                </div>
                <Link href={href}>
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                    {cta} <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/products">
              <a className="btn-primary">
                View All Products →
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Educational Callout ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-label mb-4">The Science</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-5 leading-snug">
                What are peptide bioregulators — and why do they matter?
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Peptides are the body's natural information carriers — short chains of amino acids that signal cells to maintain, repair, and regulate their own function. As we age, peptide levels decline significantly, contributing to the gradual loss of organ function and resilience.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Developed over 40+ years of research at the St. Petersburg Institute of Bioregulation and Gerontology under Prof. Vladimir Khavinson, peptide bioregulators are tissue-specific formulas that work at the cellular level — supporting the body's own regulatory systems rather than overriding them.
              </p>
              <Link href="/science">
                <a className="btn-secondary" style={{ color: "#E8793A", borderColor: "#E8793A40" }}>
                  Explore the Research →
                </a>
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { stat: "10×", text: "Peptide levels in a 55-year-old are 10 times lower than in a 20-year-old" },
                { stat: "40+", text: "Years of clinical research behind Khavinson peptide bioregulators" },
                { stat: "20–40%", text: "Potential increase in mean lifespan observed in long-term animal studies" },
                { stat: "4–6 mo", text: "Duration of effect per course — supporting sustained cellular health" },
              ].map(({ stat, text }) => (
                <div key={stat} className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600 min-w-[4rem] text-center">{stat}</div>
                  <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust / Credibility ────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {trustSignals.map(({ stat, label, sub }) => (
              <div key={label}>
                <div className="text-4xl font-bold text-orange-600 mb-1">{stat}</div>
                <div className="font-semibold text-gray-900 text-sm mb-1">{label}</div>
                <div className="text-gray-400 text-xs">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Pure Fire ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Why Pure Fire</p>
            <h2 className="text-3xl font-bold text-gray-900">
              Premium. Informed. Purposeful.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FlaskConical,
                color: "bg-blue-100 text-blue-600",
                title: "Evidence-Informed",
                text: "Every product is grounded in peer-reviewed research and clinical evidence — not marketing claims.",
              },
              {
                icon: Shield,
                color: "bg-orange-100 text-orange-600",
                title: "Exclusive Access",
                text: "The only verified Khavinson peptide bioregulator retailer in the United States.",
              },
              {
                icon: Sparkles,
                color: "bg-purple-100 text-purple-600",
                title: "Pharmaceutical Grade",
                text: "GMP-certified manufacturing. Rigorous quality standards at every step.",
              },
              {
                icon: Heart,
                color: "bg-rose-100 text-rose-600",
                title: "Mind-Body Approach",
                text: "Founded by a therapist and a fitness industry veteran — because true wellness integrates both.",
              },
            ].map(({ icon: Icon, color, title, text }) => (
              <div key={title} className="text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Assistant Callout ───────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-brand-gradient text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="section-label mb-3">Personalized Guidance</p>
          <h2 className="text-3xl font-bold mb-4">Not sure where to start?</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Our AI Wellness Assistant can help you understand which products align with your health goals, lifestyle, and areas of focus — with no pressure, no upsell.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ai-assistant">
              <a className="btn-primary">
                <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> Talk to the AI Assistant</span>
              </a>
            </Link>
            <Link href="/products">
              <a className="btn-secondary">
                Browse All Products →
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Newsletter ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-xl mx-auto text-center">
          <p className="section-label mb-3">Stay Connected</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Insights for the informed.</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Occasional updates on new products, wellness research, and perspectives on resilience, longevity, and cognitive vitality. No noise.
          </p>
          <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Your email address"
              className="flex-1 rounded-full border-gray-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubscribing}
              required
            />
            <Button
              type="submit"
              className="bg-brand-gradient hover:brightness-110 rounded-full px-6"
              disabled={isSubscribing}
            >
              {isSubscribing ? "Subscribing…" : "Subscribe"}
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-3">
            No spam. Unsubscribe anytime. Read our{" "}
            <Link href="/privacy" className="text-orange-500 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
