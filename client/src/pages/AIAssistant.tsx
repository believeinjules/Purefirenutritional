import { Link } from "wouter";
import PageSeo from "@/components/seo/PageSeo";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ShoppingCart, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Product, getProductById } from "@/data/products";
import { composeAssistantReply, type AssistantPhase } from "@/lib/assistantReply";
import { useSearch } from "wouter";
import { ClipboardList } from "lucide-react";
import type { ProtocolGoal, ProtocolSex } from "@/data/protocols";
import {
  GOAL_TEXT,
  doctorQuestionsMessage,
  parsePeppyParams,
  peppyPrefill,
  peppySchedule,
} from "@/lib/peppyContext";

/** Prefer product default/variant capsule count for cart size. */
function getDefaultCartSize(product: Product): "20" | "60" {
  const variant = product.variants?.find((v) => v.inStock) ?? product.variants?.[0];
  if (variant) {
    if (variant.id === "60-count" || /\b60\b/.test(variant.name)) return "60";
    if (variant.id === "20-count" || /\b20\b/.test(variant.name)) return "20";
  }
  return "20";
}


interface Message {
  role: "user" | "assistant";
  content: string;
  recommendations?: Product[];
  research?: { title: string; url: string }[];
  productExplanations?: { [productId: string]: string };
}

export default function AIAssistant() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<AssistantPhase>("idle");
  const contextRef = useRef("");
  const listedIdsRef = useRef<string[]>([]);
  const candidatesRef = useRef<string[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hand-off from a product page: /ai-assistant?product=&goal=&sex=
  const search = useSearch();
  const params = parsePeppyParams(search, (id) => !!getProductById(id));
  const contextProduct = params.productId ? getProductById(params.productId) : undefined;
  const [goal, setGoal] = useState<ProtocolGoal | undefined>(params.goal);
  const [sex, setSex] = useState<ProtocolSex | undefined>(params.sex);
  useEffect(() => {
    setGoal(params.goal);
    setSex(params.sex);
    if (contextProduct) setInput(peppyPrefill(contextProduct.name, params.goal));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  const schedule = contextProduct ? peppySchedule(contextProduct.id, goal, sex) : null;

  const askDoctorQuestions = () => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Questions for my doctor" },
      { role: "assistant", content: doctorQuestionsMessage(contextProduct?.name) },
    ]);
  };

  const handleSend = async (preset?: string) => {
    const textIn = (preset ?? input).trim();
    if (!textIn) return;

    const userMessage: Message = { role: "user", content: textIn };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 400));

    const reply = composeAssistantReply({
      phase: phaseRef.current,
      context: contextRef.current,
      message: textIn,
      listedIds: listedIdsRef.current,
      candidates: candidatesRef.current,
    });
    phaseRef.current = reply.phase;
    contextRef.current = reply.context;
    listedIdsRef.current = reply.listedIds;
    candidatesRef.current = reply.candidates;

    const recommendations = reply.productIds
      .map(id => getProductById(id))
      .filter((item): item is Product => item !== undefined);

    try {
      await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textIn,
          recommendedProductIds: recommendations.map(item => item.id)
        })
      });
    } catch (error) {
      console.error('Failed to log AI interaction:', error);
    }

    const assistantMessage: Message = {
      role: "assistant",
      content: reply.content,
      recommendations,
      productExplanations: reply.explanations,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const quickQuestions = [
    "What helps with energy and fatigue?",
    "Best products for brain health?",
    "How do peptide bioregulators work?",
    "What supports anti-aging?",
    "Products for joint health?",
    "How to improve sleep quality?",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo
        title="AI Health Optimizer | Pure Fire Nutritional"
        description="Use our AI Health Optimizer to find the right peptide bioregulators and longevity supplements for your wellness goals. Personalized recommendations backed by science."
        path="/ai-assistant"
        type="website"
      />
      <Navigation />

      {/* Disclaimer Modal */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-6 h-6" />
              Important Medical Disclaimer
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-gray-700 space-y-4">
            <p>
              <strong>This AI assistant is for informational purposes only.</strong>
            </p>
            <p>
              The information provided by this AI assistant is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </p>
            <p>
              Never disregard professional medical advice or delay in seeking it because of something you have read or received from this AI assistant.
            </p>
            <p>
              These products are dietary supplements and are not intended to diagnose, treat, cure, or prevent any disease. Individual results may vary.
            </p>
          </DialogDescription>
          <DialogFooter>
            <Button 
              onClick={() => setShowDisclaimer(false)}
              className="w-full bg-brand-gradient"
            >
              I Understand and Agree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-brand-gradient text-white px-6 py-2 rounded-full mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Pure Fire AI Assistant</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Your Personal Health Guide</h1>
            <p className="text-gray-600">
              Ask me about health concerns and I'll recommend products backed by science
            </p>
          </div>

          {/* Product context from the product page */}
          {contextProduct && (
            <Card className="mb-4" data-testid="peppy-product-context">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-gray-700">
                    Asking about{" "}
                    <Link href={`/products/${contextProduct.id}`} className="font-semibold text-gray-900 hover:underline">
                      {contextProduct.name}
                    </Link>
                  </p>
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label="Goal">
                    {(["preventive", "restorative"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        aria-pressed={goal === g}
                        onClick={() => {
                          setGoal(g);
                          setInput(peppyPrefill(contextProduct.name, g));
                        }}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          goal === g ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {GOAL_TEXT[g].charAt(0).toUpperCase() + GOAL_TEXT[g].slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {schedule && (
                  <div className="rounded-lg bg-gray-50 p-3 text-sm">
                    {schedule.sexSpecific && (
                      <div className="mb-2 flex gap-1.5" role="group" aria-label="Schedule for">
                        {(["women", "men"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            aria-pressed={(sex ?? "women") === s}
                            onClick={() => setSex(s)}
                            className={`rounded-full px-3 py-0.5 text-xs ${(sex ?? "women") === s ? "bg-orange-50 text-orange-800" : "text-gray-500"}`}
                          >
                            {s === "women" ? "Women's" : "Men's"}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Manufacturer protocol</p>
                    <dl className="space-y-1">
                      {schedule.rows.map((r) => (
                        <div key={r.label} className="flex justify-between gap-4">
                          <dt className="text-gray-500">{r.label}</dt>
                          <dd className="text-gray-900 text-right">{r.value}</dd>
                        </div>
                      ))}
                    </dl>
                    {schedule.note && <p className="mt-2 text-xs text-gray-500">{schedule.note}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Chat Container */}
          <Card className="mb-4">
            <CardContent className="p-4">
              {/* Messages */}
              <div className="h-96 overflow-y-auto mb-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-orange-300" />
                    <p>Hi! I'm your AI wellness assistant.</p>
                    <p className="text-sm">Ask me about any health concerns or try a quick question below.</p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                      <div className={`rounded-lg p-3 whitespace-pre-wrap ${
                        message.role === "user" 
                          ? "bg-orange-500 text-white" 
                          : "bg-white border shadow-sm"
                      }`}>
                        {message.content}
                      </div>

                      {/* Product Recommendations */}
                      {message.recommendations && message.recommendations.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Recommended Products:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {message.recommendations.map((product) => (
                              <div key={product.id} className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                {/* Product Image */}
                                {product.image && (
                                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-2 h-20 flex items-center justify-center overflow-hidden">
                                    <img 
                                      src={product.image} 
                                      alt={product.name}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        // Fallback to gradient if image fails to load
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <h4 className="font-semibold text-sm line-clamp-1">{product.name}</h4>
                                {message.productExplanations && message.productExplanations[product.id] && (
                                  <p className="text-xs text-gray-600 mt-1">{message.productExplanations[product.id]}</p>
                                )}
                                <p className="text-orange-600 font-bold text-sm mt-1">${product.priceUSD.toFixed(2)}</p>
                                <div className="flex gap-1 mt-2">
                                  <Link href={`/products/${product.id}`} className="flex-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full text-xs"
                                    >
                                      View product
                                    </Button>
                                  </Link>
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                                    onClick={() => addToCart(product, 1, getDefaultCartSize(product))}
                                  >
                                    <ShoppingCart className="w-3 h-3 mr-1" />
                                    Add to Cart
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.recommendations && message.recommendations.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs"
                          onClick={() => handleSend("Learn more")}
                        >
                          Learn more
                        </Button>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white border rounded-lg p-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length === 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInput(q);
                        }}
                        className="text-xs"
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick action: doctor questions */}
              <div className="mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={askDoctorQuestions}
                  className="text-xs"
                  data-testid="peppy-doctor-questions"
                >
                  <ClipboardList className="w-3.5 h-3.5 mr-1" />
                  Questions for my doctor
                </Button>
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about health concerns, products, or peptides..."
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleSend()}
                  className="bg-brand-gradient"
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer Footer */}
          <p className="text-xs text-gray-500 text-center">
            These statements have not been evaluated by the FDA. Always consult a medical professional.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
