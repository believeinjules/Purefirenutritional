import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { WishlistProvider } from "./contexts/WishlistContext";

// Pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import AIAssistant from "./pages/AIAssistant";
import FAQ from "./pages/FAQ";
import Science from "./pages/Science";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AuthAction from "./pages/AuthAction";
import Peptalk from "./pages/Peptalk";
import Admin from "./pages/Admin";
import ProductManager from "./pages/admin/ProductManager";
import ReviewManager from "./pages/admin/ReviewManager";
import RequireAdmin from "./components/RequireAdmin";
import Wishlist from "./pages/Wishlist";
import SiteSeo from "./components/seo/SiteSeo";

// Learn articles
import Journal from "./pages/Journal";
import ArticleKhavinsonPeptides from "./pages/learn/WhatAreKhavinsonPeptides";
import ArticleBuyKhavinsonUSA from "./pages/learn/BuyKhavinsonUSA";
import ArticlePeptidesInContext from "./pages/learn/PeptidesInContext";
import Documentation from "./pages/Documentation";
import DocumentationDetail from "./pages/DocumentationDetail";
// Store policies (copy in content/policies.ts)
import PrivacyPolicy from "./pages/policies/Privacy";
import TermsPolicy from "./pages/policies/Terms";
import ShippingPolicy from "./pages/policies/Shipping";
import ReturnsPolicy from "./pages/policies/Returns";
// Draft page: noindex, not in nav/sitemap until its copy is confirmed.
import HowToSpotAFake from "./pages/HowToSpotAFake";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Index} />
      <Route path="/products" component={Products} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/faq" component={FAQ} />
      <Route path="/science" component={Science} />
      <Route path="/research" component={Science} />
      <Route path="/about" component={About} />
      <Route path="/authenticity" component={Documentation} />
      <Route path="/authenticity/:slug" component={DocumentationDetail} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/auth/action" component={AuthAction} />
      <Route path="/peptalk" component={Peptalk} />
      <Route path="/admin">
        {() => (
          <RequireAdmin>
            <Admin />
          </RequireAdmin>
        )}
      </Route>
      <Route path="/admin/products">
        {() => (
          <RequireAdmin>
            <ProductManager />
          </RequireAdmin>
        )}
      </Route>
      <Route path="/admin/reviews">
        {() => (
          <RequireAdmin>
            <ReviewManager />
          </RequireAdmin>
        )}
      </Route>
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/journal" component={Journal} />
      <Route path="/learn/what-are-khavinson-peptide-bioregulators" component={ArticleKhavinsonPeptides} />
      <Route path="/learn/buy-khavinson-peptides-usa" component={ArticleBuyKhavinsonUSA} />
      <Route path="/learn/peptides-in-context-systems-view" component={ArticlePeptidesInContext} />
      <Route path="/how-to-spot-a-fake" component={HowToSpotAFake} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsPolicy} />
      <Route path="/shipping" component={ShippingPolicy} />
      <Route path="/returns" component={ReturnsPolicy} />
      {/* The article index lives at /journal. vercel.json 301s /learn → /journal for
          direct visits; this covers in-app navigation. */}
      <Route path="/learn">
        <Redirect to="/journal" replace />
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <TooltipProvider>
                <Toaster />
                <SiteSeo />
                <Router />
              </TooltipProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
