import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { AuthProvider } from "@/hooks/useAuth";
import { WishlistProvider } from "@/context/WishlistContext";
import { StoreSettingsProvider } from "@/context/StoreSettingsContext";
import { LookbookProvider } from "@/context/LookbookContext";
import Index from "./pages/Index.tsx";
import Shop from "./pages/Shop.tsx";
import ProductDetails from "./pages/ProductDetails.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import Wishlist from "./pages/Wishlist.tsx";
import Auth from "./pages/Auth.tsx";
import About from "./pages/About.tsx";
import Admin from "./pages/Admin.tsx";
import Contact from "./pages/Contact.tsx";
import DexterBoss from "./pages/DexterBoss.tsx";
import TrackOrder from "./pages/TrackOrder.tsx";
import NotFound from "./pages/NotFound.tsx";
import ScrollToTop from "./components/ScrollToTop";
import NavArrows from "./components/NavArrows";
import DbStatusBanner from "./components/DbStatusBanner";
import ExitIntentPopup from "./components/ExitIntentPopup";
import AdminGuard from "./components/AdminGuard";
import SmoothScroll from "./components/motion/SmoothScroll";
import LoadingScreen from "./components/motion/LoadingScreen";
import PageTransition from "./components/motion/PageTransition";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/dexter-boss" element={<DexterBoss />} />
        <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </PageTransition>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <StoreSettingsProvider>
          <LookbookProvider>
          <ProductsProvider>
            <WishlistProvider>
              <CartProvider>
                <Toaster />
                <Sonner />
                <SmoothScroll />
                <LoadingScreen />
                <ScrollToTop />
                <NavArrows />
                <DbStatusBanner />
                <ExitIntentPopup />
                <AnimatedRoutes />
              </CartProvider>
            </WishlistProvider>
          </ProductsProvider>
          </LookbookProvider>
          </StoreSettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
