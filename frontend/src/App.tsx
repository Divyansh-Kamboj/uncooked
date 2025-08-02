import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import { EndSession } from "./pages/EndSession";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Payment from "./pages/Payment";

const queryClient = new QueryClient();

// Step 1: Simplified App.tsx Authentication Logic
const AppContent = () => {
  // The new AuthProvider handles all session/profile logic and redirects.
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/end-session" element={<EndSession />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/account" element={<Account />} />
      <Route path="/payment" element={<Payment />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
