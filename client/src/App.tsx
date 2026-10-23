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
import BrowseCategoryPage from "./pages/BrowseCategoryPage";
import SystemsLanding from "./pages/SystemsLanding";
import KhavinsonPeptidesList from "./pages/KhavinsonPeptidesList";
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
import WriteReview from "./pages/review/WriteReview";
import { lazy, Suspense } from "react";
// DEV-only mock moderation preview (dropped from production builds).
const DevReviewsAdminPreview = import.meta.env.DEV ? lazy(() => import("./pages/review/DevReviewsAdminPreview")) : null;
import SiteSeo from "./components/seo/SiteSeo";

// Learn articles
import Journal from "./pages/Journal";
import ArticleKhavinsonPeptides from "./pages/learn/WhatAreKhavinsonPeptides";
import ArticleBuyKhavinsonUSA from "./pages/learn/BuyKhavinsonUSA";
import ArticlePeptidesInContext from "./pages/learn/PeptidesInContext";
import ArticlePerimenopauseOralEvidence from "./pages/learn/PerimenopauseOralEvidence";
import ArticleWhyBuyFromPureFire from "./pages/learn/WhyBuyFromPureFire";
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
      {/* Category pages: registered before /products/:id */}
      <Route path="/products/system" component={SystemsLanding} />
      <Route path="/products/system/:slug">{() => <BrowseCategoryPage kind="system" />}</Route>
      <Route path="/products/collection/:slug">{() => <BrowseCategoryPage kind="collection" />}</Route>
      <Route path="/products/goal/:slug">{() => <BrowseCategoryPage kind="goal" />}</Route>
      <Route path="/khavinson-peptides-list" component={KhavinsonPeptidesList} />
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
      {/* Customer review form (noindex; link sent by Julia) */}
      <Route path="/review" component={WriteReview} />
      <Route path="/review/:slug" component={WriteReview} />
      {DevReviewsAdminPreview && (
        <Route path="/__dev/reviews-admin">
          {() => (
            <Suspense fallback={null}>
              <DevReviewsAdminPreview />
            </Suspense>
          )}
        </Route>
      )}
      <Route path="/learn" component={Journal} />
      <Route path="/journal">
        <Redirect to="/learn" replace />
      </Route>
      <Route path="/learn/what-are-khavinson-peptide-bioregulators" component={ArticleKhavinsonPeptides} />
      <Route path="/learn/buy-khavinson-peptides-usa" component={ArticleBuyKhavinsonUSA} />
      <Route path="/learn/peptides-in-context-systems-view" component={ArticlePeptidesInContext} />
      <Route path="/learn/khavinson-bioregulators-perimenopause-oral-evidence" component={ArticlePerimenopauseOralEvidence} />
      <Route path="/learn/why-buy-khavinson-peptides-from-pure-fire" component={ArticleWhyBuyFromPureFire} />
      <Route path="/how-to-spot-a-fake" component={HowToSpotAFake} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsPolicy} />
      <Route path="/shipping" component={ShippingPolicy} />
      <Route path="/returns" component={ReturnsPolicy} />
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
