import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, Award, Users, Globe, Microscope, ArrowRight, Mail } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-amber-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
              <img 
                src="/logo-flame.png" 
                alt="Pure Fire Nutritional" 
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>
          
          <Badge className="bg-white/20 text-white border-white/30 text-lg px-6 py-3 rounded-full">
            Our Story
          </Badge>
          
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
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full"
              >
                View Research
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Rest of About page content... */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Mission Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            To provide cutting-edge nutritional supplements and peptide bioregulators that help people 
            achieve optimal health, longevity, and peak performance through science-backed formulations.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-amber-600 mb-4" />
              <CardTitle>Quality First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Every product undergoes rigorous testing and quality control to ensure purity and potency.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Microscope className="h-12 w-12 text-amber-600 mb-4" />
              <CardTitle>Science-Backed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our formulations are based on peer-reviewed research and clinical studies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-12 w-12 text-amber-600 mb-4" />
              <CardTitle>Customer Care</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We're committed to supporting your health journey with expert guidance and support.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-xl mb-6">Have questions? We're here to help!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="tel:3155677931" className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5" />
              (315) 567-7931
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
