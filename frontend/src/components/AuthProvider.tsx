import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

interface SupabaseUser {
  id: string;
  email: string | null;
  plan: 'free' | 'nerd' | 'uncooked' | null;
  is_paid: boolean;
  created_at: string;
  daily_questions_used: number;
  daily_ai_explanations_used: number;
  last_reset_date: string;
}

interface AuthContextType {
  supabaseUser: SupabaseUser | null;
  isLoadingUser: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentRoute = (): string => {
    // For HashRouter, we should always use the hash
    const hash = window.location.hash;
    if (hash && hash.startsWith('#')) {
      const route = hash.slice(1);
      return route || '/';
    }
    // Fallback for environments where location.hash is not set yet
    return location.pathname || '/';
  };

  // Function to fetch user from Supabase
  const fetchSupabaseUser = async (userId: string): Promise<SupabaseUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching user from Supabase:', error);
        return null;
      }

      return data as SupabaseUser;
    } catch (error) {
      console.error('Unexpected error fetching user:', error);
      return null;
    }
  };

  // Function to create user in Supabase
  const createSupabaseUser = async (userId: string, email: string): Promise<SupabaseUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email: email,
            plan: null,
            is_paid: false,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user in Supabase:', error);
        return null;
      }

      return data as SupabaseUser;
    } catch (error) {
      console.error('Unexpected error creating user:', error);
      return null;
    }
  };

  // Function to refresh user data
  const refreshUser = useCallback(async () => {
    if (!clerkUser) {
      setSupabaseUser(null);
      return;
    }

    setIsLoadingUser(true);
    let user = await fetchSupabaseUser(clerkUser.id);
    
    if (!user) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';
      user = await createSupabaseUser(clerkUser.id, email);
    }

    setSupabaseUser(user);
    setIsLoadingUser(false);
  }, [clerkUser]);

  // Handle user authentication flow
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (!clerkUser) {
      setSupabaseUser(null);
      setIsLoadingUser(false);
      return;
    }

    refreshUser();
  }, [clerkUser, isClerkLoaded, refreshUser]);

  // Handle navigation logic based on user state
  useEffect(() => {
    if (!isClerkLoaded || isLoadingUser) return;

    const currentRoute = getCurrentRoute();

    // Allow public routes if not signed in
    if (!clerkUser) {
      const publicRoutes = ['/', '/signin', '/signup', '/reset-password', '/about', '/contact', '/terms-and-conditions', '/privacy-policy', '/refund-policy', '/faq'];
      if (!publicRoutes.includes(currentRoute)) {
        navigate('/signin', { replace: true });
      }
      return;
    }

    if (!supabaseUser) {
      console.warn('Clerk user exists but no Supabase user found');
      return;
    }

    // Plan routing
    if (supabaseUser.plan === null && currentRoute !== '/pricing') {
      navigate('/pricing', { replace: true });
      return;
    }

    if ((supabaseUser.plan === 'nerd' || supabaseUser.plan === 'uncooked') && !supabaseUser.is_paid && currentRoute === '/dashboard') {
      navigate('/payment', { replace: true });
      return;
    }
  }, [clerkUser, supabaseUser, isLoadingUser, isClerkLoaded, location.hash, location.pathname, navigate]);

  const value: AuthContextType = {
    supabaseUser,
    isLoadingUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
