import React, { useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import { EndSession } from "./pages/EndSession";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Payment from "./pages/Payment";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import FAQ from "./pages/FAQ";
import Footer from "./components/Footer";
import { ClerkProvider } from "@clerk/clerk-react";
import { AuthProvider } from "./components/AuthProvider";
import useTabAnimation from "./hooks/useTabAnimation";

const queryClient = new QueryClient();

// App content with AuthProvider handling user flow
const AppContent = () => {
  // Initialize tab animation
  useTabAnimation();
  
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/end-session" element={<EndSession />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account" element={<Account />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </ClerkProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
