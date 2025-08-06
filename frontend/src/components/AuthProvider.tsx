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
          // User not found - this is expected for new users
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
            plan: null, // Will be set on pricing page
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
    
    // If user doesn't exist in Supabase, create them
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
      // User is not signed in
      setSupabaseUser(null);
      setIsLoadingUser(false);
      return;
    }

    // User is signed in, sync with Supabase
    refreshUser();
  }, [clerkUser, isClerkLoaded, refreshUser]);

  // Handle navigation logic based on user state
  useEffect(() => {
    if (!isClerkLoaded || isLoadingUser) return;

    // If user is not signed in, allow them to access public routes
    if (!clerkUser) {
      const publicRoutes = ['/', '/signin', '/signup', '/reset-password'];
      if (!publicRoutes.includes(location.pathname)) {
        navigate('/signin', { replace: true });
      }
      return;
    }

    // User is signed in but doesn't have a Supabase user record
    if (!supabaseUser) {
      // This shouldn't happen with our sync logic, but handle gracefully
      console.warn('Clerk user exists but no Supabase user found');
      return;
    }

    // User exists in Supabase - handle routing based on their plan status
    const currentPath = location.pathname;

    // If user hasn't selected a plan yet (plan is null), redirect to pricing
    if (supabaseUser.plan === null && currentPath !== '/pricing') {
      navigate('/pricing', { replace: true });
      return;
    }

    // If user has selected a plan but it's 'free', they can access dashboard
    if (supabaseUser.plan === 'free' && currentPath === '/pricing') {
      // Don't redirect away from pricing if they want to upgrade
      return;
    }

    // If user has a paid plan but hasn't paid yet, and tries to access dashboard
    if ((supabaseUser.plan === 'nerd' || supabaseUser.plan === 'uncooked') && 
        !supabaseUser.is_paid && 
        currentPath === '/dashboard') {
      navigate('/payment', { replace: true });
      return;
    }

  }, [clerkUser, supabaseUser, isLoadingUser, isClerkLoaded, location.pathname, navigate]);

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
