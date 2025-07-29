import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { ProfileManager } from "@/components/ProfileManager";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import { EndSession } from "./pages/EndSession";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Step 1: Simplified App.tsx Authentication Logic
const AppContent = () => {
  const { session, user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  // Step 5: Simple Redirect Logic
  useEffect(() => {
    if (loading) return; // Wait for auth check

    const publicPaths = ['/', '/signin', '/reset-password', '/end-session'];
    const isPublicPath = publicPaths.includes(location.pathname);

    if (!session && !isPublicPath) {
      // Not authenticated and trying to access protected route
      navigate('/signin');
    } else if (session && location.pathname === '/signin') {
      // Authenticated user on signin page
      if (profile?.plan === 'basic') {
        navigate('/pricing');
      } else {
        navigate('/dashboard');
      }
    }
  }, [session, profile, location.pathname, navigate, loading]);

  // Display loading screen while checking authentication status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-pulse">🔥</div>
          <p className="text-xl text-orange-800 font-semibold">Loading...</p>
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <ProfileManager>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/end-session" element={<EndSession />} />
        <Route path="*" element={<NotFound />} />

        {/* Protected routes */}
        <Route path="/pricing" element={session ? <Pricing /> : <SignIn />} />
        <Route path="/dashboard" element={session ? <Dashboard /> : <SignIn />} />
        <Route path="/account" element={session ? <Account /> : <SignIn />} />
      </Routes>
    </ProfileManager>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
