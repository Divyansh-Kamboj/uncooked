import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
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
  const { user: auth0User, isAuthenticated, isLoading: isAuth0Loading } = useAuth0();
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
    if (!auth0User) {
      setSupabaseUser(null);
      return;
    }

    setIsLoadingUser(true);
    let user = await fetchSupabaseUser(auth0User.sub || '');

    if (!user) {
      const email = auth0User.email || '';
      user = await createSupabaseUser(auth0User.sub || '', email);
    }

    setSupabaseUser(user);
    setIsLoadingUser(false);
  }, [auth0User]);

  // Handle user authentication flow
  useEffect(() => {
    if (isAuth0Loading) return;

    if (!isAuthenticated || !auth0User) {
      setSupabaseUser(null);
      setIsLoadingUser(false);
      return;
    }

    refreshUser();
  }, [auth0User, isAuthenticated, isAuth0Loading, refreshUser]);

  // Handle navigation logic based on user state
  useEffect(() => {
    if (isAuth0Loading || isLoadingUser) return;

    // If user is signed in, handle plan routing
    if (isAuthenticated && auth0User && supabaseUser) {
      const currentRoute = getCurrentRoute();

      // Plan routing
      if (supabaseUser.plan === null && currentRoute !== '/pricing' && currentRoute !== '/payment' && currentRoute !== '/') {
        navigate('/pricing', { replace: true });
        return;
      }

      // Only redirect to payment if user has a plan but hasn't paid AND is on dashboard
      if ((supabaseUser.plan === 'nerd' || supabaseUser.plan === 'uncooked') && !supabaseUser.is_paid && currentRoute === '/dashboard') {
        navigate('/payment', { replace: true });
        return;
      }

      // If user has a paid plan and is on payment page, redirect to dashboard
      if (supabaseUser.is_paid && (supabaseUser.plan === 'nerd' || supabaseUser.plan === 'uncooked') && currentRoute === '/payment') {
        navigate('/dashboard', { replace: true });
        return;
      }
    }
  }, [auth0User, supabaseUser, isLoadingUser, isAuth0Loading, isAuthenticated, navigate]);

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
