import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
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
import { ClerkProvider } from "@clerk/clerk-react";

const queryClient = new QueryClient();

// Step 1: Simplified App.tsx Authentication Logic
const AppContent = () => {
  // The new AuthProvider handles all session/profile logic and redirects.
  return (
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
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ClerkProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
