import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Flame, 
  Award, 
  FlaskConical, 
  Shield, 
  Heart, 
  Brain, 
  Sparkles,
  CheckCircle,
  ArrowRight,
  Mail
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-400 via-orange-300 to-rose-400 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo Badge */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-full blur-sm"></div>
              <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-400 overflow-hidden">
                <img 
                  src="/logo-flame.jpeg" 
                  alt="Pure Fire Nutritional Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Premium Badge */}
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <span className="text-white font-medium">Premium Health & Longevity</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Pure Fire Nutritional
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Scientifically-backed supplements, anti-aging solutions, and exclusive Khavinson peptide bioregulators for comprehensive health optimization, longevity, and peak performance
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/products">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg rounded-full">
                Explore Products <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/ai-assistant">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-full">
                <Sparkles className="mr-2 w-5 h-5" /> Health Optimizer
              </Button>
            </Link>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Exclusive US Khavinson Retailer</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span>40+ Years of Research</span>
            </div>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              <span>Scientifically Validated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Mail className="w-12 h-12 text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-6">
            Get exclusive access to new products, health insights, and special offers. Join thousands of health enthusiasts on their longevity journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1"
            />
            <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600">
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            No spam, unsubscribe at any time. Read our <Link href="/privacy" className="text-orange-500 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Comprehensive Health Solutions</h2>
          <p className="text-gray-600 text-center mb-12">
            From foundational nutrition to advanced anti-aging, and exclusive peptide bioregulators
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Nutritional Supplements */}
            <Card className="border-2 hover:border-orange-500 transition-colors">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Nutritional Supplements</h3>
                <p className="text-gray-600 mb-4">
                  Essential building blocks, and specialized nutrition for optimal health
                </p>
                <div className="space-y-2 mb-6">
                  <p className="text-sm"><strong>Foundational Health</strong></p>
                  <p className="text-gray-500 text-sm">Multivitamins, Vitamin D, Omega-3, and minerals</p>
                  <p className="text-sm"><strong>Specialized Nutrition</strong></p>
                  <p className="text-gray-500 text-sm">Probiotics, immune support, energy, and sleep & recovery</p>
                </div>
                <Link href="/products?category=NUTRITIONAL+SUPPLEMENTS">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Shop Supplements
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Anti-Aging & Longevity */}
            <Card className="border-2 hover:border-orange-500 transition-colors">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Anti-Aging & Longevity</h3>
                <p className="text-gray-600 mb-4">
                  Scientifically-backed solutions for healthy aging, and longevity
                </p>
                <div className="space-y-2 mb-6">
                  <p className="text-sm"><strong>Cellular Health</strong></p>
                  <p className="text-gray-500 text-sm">NAD+ boosters, mitochondrial support, and antioxidants</p>
                  <p className="text-sm"><strong>Hormone Optimization</strong></p>
                  <p className="text-gray-500 text-sm">Growth hormone, testosterone, estrogen, and thyroid support</p>
                  <p className="text-sm"><strong>Cognitive Enhancement</strong></p>
                  <p className="text-gray-500 text-sm">Nootropics, memory support, focus, and neuroprotection</p>
                </div>
                <Link href="/products?category=ANTI+AGING-LONGEVITY">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Explore Anti-Aging
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Peptide Bioregulators */}
            <Card className="border-2 border-orange-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs px-3 py-1">
                Exclusive US Retailer
              </div>
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <FlaskConical className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Peptide Bioregulators</h3>
                <p className="text-gray-600 mb-4">
                  Premium Khavinson peptides - scientifically advanced bioregulators
                </p>
                <div className="space-y-2 mb-6">
                  <p className="text-sm"><strong>Natural Bioregulators</strong></p>
                  <p className="text-gray-500 text-sm">Cytomaxes - animal-derived peptides by body system</p>
                  <p className="text-sm"><strong>Synthetic Bioregulators</strong></p>
                  <p className="text-gray-500 text-sm">Cytogens - laboratory-created advanced peptides</p>
                  <p className="text-sm"><strong>Peptide Complexes</strong></p>
                  <p className="text-gray-500 text-sm">Multi-peptide formulations for comprehensive support</p>
                </div>
                <Link href="/products?category=PEPTIDE+BIOREGULATORS">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600">
                    Discover Peptides
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Why Choose Pure Fire Nutritional?</h2>
          <p className="text-gray-600 text-center mb-12">
            Combining cutting-edge science with premium quality for optimal health outcomes
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">Scientifically Validated</h3>
              <p className="text-gray-600 text-sm">
                All products backed by rigorous research, and clinical studies
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold mb-2">Exclusive Partnerships</h3>
              <p className="text-gray-600 text-sm">
                Only verified Khavinson peptide retailer in the United States
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold mb-2">Premium Quality</h3>
              <p className="text-gray-600 text-sm">
                Pharmaceutical-grade supplements, and bioregulator peptides
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="font-bold mb-2">Comprehensive Care</h3>
              <p className="text-gray-600 text-sm">
                From foundational health to advanced longevity solutions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Health?</h2>
          <p className="text-xl mb-8 opacity-90">
            Discover our comprehensive range of scientifically-backed health, and longevity solutions
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg rounded-full">
              Shop All Products <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
