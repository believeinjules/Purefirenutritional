import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ShoppingCart, AlertTriangle, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { products, Product, getProductById } from "@/data/products";
import { getAIRecommendations, getRecommendationExplanation } from "@/data/aiRecommendations";
import { getRecommendations as getFrequentlyBought } from "@/data/productRecommendations";

interface Message {
  role: "user" | "assistant";
  content: string;
  recommendations?: Product[];
  research?: { title: string; url: string }[];
}

// This mapping is now handled by aiRecommendations.ts

// Research papers
const researchPapers = [
  { title: "Peptide Bioregulators: A New Class of Geroprotectors", url: "https://pubmed.ncbi.nlm.nih.gov/31489893/" },
  { title: "Short Peptides Regulate Gene Expression", url: "https://pubmed.ncbi.nlm.nih.gov/32093678/" },
  { title: "Epithalamin and Thymalin in Aging Prevention", url: "https://pubmed.ncbi.nlm.nih.gov/12374906/" },
  { title: "NAD+ and Cellular Aging", url: "https://pubmed.ncbi.nlm.nih.gov/29432159/" },
  { title: "Spermidine and Autophagy", url: "https://pubmed.ncbi.nlm.nih.gov/27411589/" },
  { title: "CoQ10 and Mitochondrial Function", url: "https://pubmed.ncbi.nlm.nih.gov/24389208/" },
];

function getProductRecommendations(query: string): Product[] {
  // Use new AI recommendation logic
  const recommendedIds = getAIRecommendations(query, 4);
  
  // Get products matching the IDs
  const recommended = recommendedIds
    .map(id => getProductById(id))
    .filter((p): p is Product => p !== undefined);
  
  // If we have recommendations, also add frequently bought together items
  if (recommended.length > 0) {
    const mainProduct = recommended[0];
    const frequentlyBought = getFrequentlyBought(mainProduct.id, 1)
      .map(rec => getProductById(rec.productId))
      .filter((p): p is Product => p !== undefined && !recommended.some(r => r.id === p.id));
    
    return [...recommended, ...frequentlyBought].slice(0, 4);
  }
  
  // If no specific matches, return general recommendations
  return products.slice(0, 4);
}

function getRelevantResearch(query: string): { title: string; url: string }[] {
  const lowerQuery = query.toLowerCase();
  const relevant: { title: string; url: string }[] = [];
  
  if (lowerQuery.includes("peptide") || lowerQuery.includes("aging") || lowerQuery.includes("longevity")) {
    relevant.push(researchPapers[0], researchPapers[1], researchPapers[2]);
  }
  if (lowerQuery.includes("energy") || lowerQuery.includes("nad") || lowerQuery.includes("mitochondr")) {
    relevant.push(researchPapers[3], researchPapers[5]);
  }
  if (lowerQuery.includes("autophagy") || lowerQuery.includes("spermidine") || lowerQuery.includes("cellular")) {
    relevant.push(researchPapers[4]);
  }
  
  return relevant.length > 0 ? relevant.slice(0, 3) : researchPapers.slice(0, 2);
}

function generateResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("energy") || lowerQuery.includes("fatigue") || lowerQuery.includes("tired")) {
    return "For energy and fatigue support, I recommend focusing on mitochondrial health. CoQ10 Ubiquinol is excellent for cellular energy production, while NAD+ Booster supports DNA repair and metabolic function. These work synergistically to combat fatigue at the cellular level.";
  }
  
  if (lowerQuery.includes("brain") || lowerQuery.includes("memory") || lowerQuery.includes("cognitive") || lowerQuery.includes("focus")) {
    return "For cognitive support, Cytomax Brain contains bioregulator peptides specifically targeting brain tissue. Combined with Omega-3 Premium for essential fatty acids, this can support memory, focus, and overall brain health. Revilab ML 07 offers comprehensive neurological support.";
  }
  
  if (lowerQuery.includes("heart") || lowerQuery.includes("cardiovascular") || lowerQuery.includes("circulation")) {
    return "For cardiovascular health, Chelohart is a heart peptide bioregulator that supports cardiac muscle function. Ventfort and Vesugen support blood vessel health and circulation. CoQ10 Ubiquinol is also essential for heart muscle energy production.";
  }
  
  if (lowerQuery.includes("immune") || lowerQuery.includes("immunity") || lowerQuery.includes("defense")) {
    return "For immune support, Crystagen and Vladonix are excellent peptide bioregulators. Crystagen enhances cellular immunity while Vladonix supports thymus function, which is crucial for immune regulation. Probiotics Advanced also supports gut-immune connection.";
  }
  
  if (lowerQuery.includes("joint") || lowerQuery.includes("arthritis") || lowerQuery.includes("mobility")) {
    return "For joint health, Cartalax is a cartilage peptide bioregulator that supports connective tissue. Prime Peptide Joints offers comprehensive joint support, while Revilab ML 06 targets the entire musculoskeletal system. Omega-3s can also help with inflammation.";
  }
  
  if (lowerQuery.includes("aging") || lowerQuery.includes("longevity") || lowerQuery.includes("anti-aging")) {
    return "For anti-aging and longevity, Cytogen AEDG is a synthetic tetrapeptide for epigenetic regulation. Spermidine Longevity supports autophagy (cellular cleanup), NAD+ Booster supports cellular energy and DNA repair, and Resveratrol Complex provides powerful antioxidant protection.";
  }
  
  if (lowerQuery.includes("sleep") || lowerQuery.includes("insomnia")) {
    return "For sleep support, Endoluten is a pineal gland peptide that helps regulate circadian rhythm and melatonin production. Cytomax Pineal offers similar benefits. Revilab SL 07 can help with stress response which often affects sleep quality.";
  }
  
  if (lowerQuery.includes("peptide")) {
    return "Khavinson peptide bioregulators are short-chain peptides that help regulate gene expression in specific tissues. They're based on over 40 years of Russian research. We offer natural bioregulators (Cytomaxes), synthetic versions (Cytogens), and multi-peptide complexes (Revilab series).";
  }
  
  return "Based on your question, I've selected some products that may help. Our peptide bioregulators are backed by over 40 years of research and target specific organ systems. Feel free to ask about any specific health concerns - I can provide more targeted recommendations for energy, brain health, immune support, joints, anti-aging, sleep, and more.";
}

export default function AIAssistant() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500));

    const recommendations = getProductRecommendations(input);
    const research = getRelevantResearch(input);
    const response = getRecommendationExplanation(input);

    // Log AI interaction to backend for quality assurance (no chat history stored)
    try {
      await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          recommendedProductIds: recommendations.map(p => p.id)
        })
      });
    } catch (error) {
      console.error('Failed to log AI interaction:', error);
    }

    const assistantMessage: Message = {
      role: "assistant",
      content: response,
      recommendations,
      research,
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
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500"
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
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-2 rounded-full mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Peptalk! AI Assistant</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Your Personal Health Guide</h1>
            <p className="text-gray-600">
              Ask me about health concerns and I'll recommend products backed by science
            </p>
          </div>

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
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                      <div className={`rounded-lg p-3 ${
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
                                <p className="text-orange-600 font-bold text-sm">${product.priceUSD.toFixed(2)}</p>
                                <Button
                                  size="sm"
                                  className="w-full mt-2 bg-green-600 hover:bg-green-700 text-xs"
                                  onClick={() => addToCart(product, 1, "20")}
                                >
                                  <ShoppingCart className="w-3 h-3 mr-1" />
                                  Add to Cart
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Research Links */}
                      {message.research && message.research.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Related Research:</p>
                          <div className="space-y-1">
                            {message.research.map((paper, i) => (
                              <a
                                key={i}
                                href={paper.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {paper.title}
                              </a>
                            ))}
                          </div>
                        </div>
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
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full flex items-center justify-center">
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
                  onClick={handleSend}
                  className="bg-gradient-to-r from-orange-500 to-rose-500"
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer Footer */}
          <p className="text-xs text-gray-500 text-center">
            This AI assistant provides general information only and is not a substitute for professional medical advice.
            Always consult with a healthcare provider before starting any supplement regimen.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
