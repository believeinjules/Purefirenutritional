import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Shield, Award, Users, Globe, Microscope, ArrowRight, Mail } from 'lucide-react';
import { Link } from 'wouter';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-amber-50">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
              <img 
                src="/logo-flame.jpeg" 
                alt="Pure Fire Nutritional" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <Badge className="bg-white/20 text-white border-white/30 text-lg px-6 py-3 rounded-full">
              Our Story
            </Badge>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 leading-tight">
            About Pure Fire Nutritional
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl mb-8 opacity-90 max-w-4xl mx-auto leading-relaxed">
            Pioneering the future of health optimization through scientifically-backed supplements, 
            anti-aging solutions, and exclusive peptide bioregulators
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button 
                size="lg" 
                className="bg-white text-amber-600 hover:bg-amber-50 px-8 py-4 text-lg font-semibold rounded-full"
              >
                Explore Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/science">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg rounded-full backdrop-blur-sm"
              >
                <Microscope className="mr-2 h-5 w-5" />
                Our Science
              </Button>
            </Link>
          </div>
        </div>
      </section>



      {/* Founders Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
              Meet Our Founders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Forging resilience from the inside out
            </p>
            
            {/* Founder Photos - Side by Side */}
            <div className="flex justify-center items-center gap-8 mb-12">
              <div className="text-center">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mx-auto mb-3 shadow-lg">
                  <img 
                    src="/founders/julia-shulman.jpg" 
                    alt="Julia Shulman" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-semibold text-gray-800">Julia Shulman</p>
                <p className="text-sm text-amber-600">Co-Founder</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mx-auto mb-3 shadow-lg">
                  <img 
                    src="/founders/benjamin-peker.jpg" 
                    alt="Benjamin Peker" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-semibold text-gray-800">Benjamin Peker</p>
                <p className="text-sm text-amber-600">Co-Founder</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Julia Shulman */}
            <Card className="hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Julia Shulman</CardTitle>
                <CardDescription className="text-lg text-amber-600 font-semibold">Co-Founder</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Holistic Wellness Expert, Family Therapist, Wellness Coach, and Hypnotherapist dedicated to empowering individuals and families to lead fulfilling lives.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-800">Academic Background:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• MA in Forensic Mental Health Counseling (John Jay College)</li>
                    <li>• MS in History & Theory of Psychology (University of Edinburgh)</li>
                    <li>• BA Cum Laude in Forensic Psychology (John Jay College)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-800">Certifications:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• LIBERATE Certified Meditation Coach</li>
                    <li>• Emotional Freedom Technique (EFT) Certified</li>
                    <li>• Komyo ReikiDo Shihan/Master</li>
                  </ul>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Founder of <strong>Mindscaping NYC</strong>, a successful wellness and hypnotherapy practice focused on personalized plans for stress management, holistic health, and personal development.
                </p>
              </CardContent>
            </Card>

            {/* Benjamin Peker */}
            <Card className="hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Benjamin Peker</CardTitle>
                <CardDescription className="text-lg text-amber-600 font-semibold">Co-Founder</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Industry veteran with over 20 years of combined experience in the fitness, nutrition, and business industries, bringing a unique blend of business acumen and wellness knowledge.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-800">Professional Experience:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• General Manager at Retro Fitness</li>
                    <li>• Founder of Pure Fire Nutritional Supplements LLC</li>
                    <li>• Founder of Lapis AI Consults</li>
                    <li>• IT Support & Network Administration</li>
                  </ul>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  With extensive leadership in the fitness industry, Benjamin brings deep understanding of consumer needs and market dynamics, combined with a passion for leveraging technology and AI for business innovation.
                </p>
                <p className="text-gray-700 leading-relaxed italic">
                  Committed to continuous improvement, exceptional service, and the belief that a positive attitude impacts every aspect of life and business.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Philosophy Section */}
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-amber-200">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                The Pure Fire Philosophy
              </CardTitle>
              <CardDescription className="text-lg text-gray-700">
                A Note from Our Founders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-700 leading-relaxed max-w-4xl mx-auto">
              <p className="text-lg">
                For a combined two decades, we have dedicated our lives to exploring the frontiers of human potential, but from two very different, yet complementary, worlds. One of us (Benjamin) has been on the front lines of physical performance, building and managing fitness empires where the drive for peak physical condition is relentless. The other (Julia) has worked in the intricate world of the human mind, guiding individuals and families toward holistic wellness and mental resilience as a therapist and wellness coach.
              </p>
              <p className="text-lg">
                We saw the same struggle from two different angles: people were either building an engine with no driver or training a driver with no engine. The market was saturated with supplements that promised to fuel the body but ignored the mind—the very source of our drive, focus, and resilience.
              </p>
              <blockquote className="border-l-4 border-amber-500 pl-6 py-2 italic text-xl text-gray-800">
                "We realized that true strength isn't just about what your body can endure. It's about the fire in your mind. We wanted to create something that fuels both."
              </blockquote>
              <p className="text-lg">
                That is the genesis of Pure Fire. It's the culmination of our shared mission to bridge the gap between mental and physical excellence. We grew frustrated with the endless sea of products that offered temporary fixes but failed to create lasting, integrated strength. So, we decided to build it ourselves.
              </p>
              <h3 className="text-2xl font-bold text-gray-800 pt-4">Unifying Mind and Body</h3>
              <p className="text-lg">
                Our approach is what makes Pure Fire fundamentally different. We've woven together two distinct fields of expertise into a single, powerful philosophy.
              </p>
              <p className="text-lg">
                With Benjamin's 20+ years of in-the-trenches experience in the fitness and nutrition industry, we understand what it takes to drive physical performance. This is complemented by Julia's deep clinical and academic background in mental wellness—holding Masters degrees in both Psychology and Mental Health Counseling and running a successful wellness and hypnotherapy practice, Mindscaping NYC.
              </p>
              <blockquote className="border-l-4 border-amber-500 pl-6 py-2 italic text-xl text-gray-800">
                "Pure Fire isn't just a product; it's a principle. It's the understanding that your mental clarity and your physical vitality are not separate. They are one and the same."
              </blockquote>
              <p className="text-lg">
                We've obsessed over curating authentic, science-backed products that we, and our families, would not just take, but trust implicitly. For us, a fulfilling life is about more than just achieving goals. It's about having the energy and mental clarity to be present for our loved ones and to live with a sense of purpose, every single day.
              </p>
              <p className="text-lg font-semibold text-center pt-4">
                Pure Fire is the tool we created to help us, and now you, do just that.
              </p>
              <p className="text-center text-gray-600 pt-4">
                We are incredibly proud to share this with you.
              </p>
              <p className="text-center font-semibold text-lg text-gray-800 pt-2">
                Julia Shulman & Benjamin Peker<br />
                <span className="text-amber-600">Co-Founding Partners, Pure Fire</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>



      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At Pure Fire Nutritional, we believe that optimal health and longevity should be 
                accessible to everyone. Our mission is to bridge the gap between cutting-edge 
                scientific research and practical health solutions.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We are committed to providing the highest quality supplements, backed by rigorous 
                research and manufactured to pharmaceutical standards, helping our customers achieve 
                their health and longevity goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Us
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">40+ Years</CardTitle>
                  <CardDescription>Research Foundation</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Exclusive</CardTitle>
                  <CardDescription>US Khavinson Retailer</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">10,000+</CardTitle>
                  <CardDescription>Satisfied Customers</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="bg-gradient-to-r from-rose-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Global</CardTitle>
                  <CardDescription>Shipping Available</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>



      {/* Values Section */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at Pure Fire Nutritional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Microscope className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">Scientific Integrity</CardTitle>
                <CardDescription className="text-gray-600">
                  Every product is backed by rigorous research and clinical evidence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We never compromise on scientific accuracy. Our formulations are based on 
                  peer-reviewed research and proven clinical outcomes.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">Quality Excellence</CardTitle>
                <CardDescription className="text-gray-600">
                  Pharmaceutical-grade manufacturing and third-party testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We maintain the highest quality standards through rigorous testing, 
                  premium ingredients, and state-of-the-art manufacturing processes.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">Customer Care</CardTitle>
                <CardDescription className="text-gray-600">
                  Personalized support for your health optimization journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your health goals are our priority. We provide personalized guidance 
                  and support to help you achieve optimal wellness and longevity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Join Our Health Community
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your journey to optimal health and longevity with Pure Fire Nutritional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button 
                size="lg" 
                className="bg-white text-amber-600 hover:bg-amber-50 px-8 py-4 text-lg font-semibold rounded-full"
              >
                Shop Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg rounded-full backdrop-blur-sm"
              >
                Create Account
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}