import React, { useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import AuthFlow from "./components/AuthFlow";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import { EndSession } from "./pages/EndSession";

import NotFound from "./pages/NotFound";
import Payment from "./pages/Payment";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import FAQ from "./pages/FAQ";
import Footer from "./components/Footer";
import Auth0ProviderWrapper from "./components/Auth0Provider";
import Auth0Callback from "./components/Auth0Callback";
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
            <Route path="/" element={<AuthFlow />} />
            <Route path="/callback" element={<Auth0Callback />} />

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
      <Auth0ProviderWrapper>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </Auth0ProviderWrapper>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
