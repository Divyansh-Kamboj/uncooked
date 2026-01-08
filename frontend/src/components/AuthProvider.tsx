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
  const { user: auth0User, isLoading: isAuth0Loading, isAuthenticated } = useAuth0();
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
    if (!isAuthenticated || !auth0User) {
      setSupabaseUser(null);
      return;
    }

    setIsLoadingUser(true);
    const userId = auth0User.sub as string;
    let user = await fetchSupabaseUser(userId);
    
    // If user doesn't exist in Supabase, create them
    if (!user) {
      const email = (auth0User.email as string) || '';
      user = await createSupabaseUser(userId, email);
    }

    setSupabaseUser(user);
    setIsLoadingUser(false);
  }, [isAuthenticated, auth0User]);

  // Handle user authentication flow
  useEffect(() => {
    if (isAuth0Loading) return;

    if (!isAuthenticated || !auth0User) {
      // User is not signed in
      setSupabaseUser(null);
      setIsLoadingUser(false);
      return;
    }

    // User is signed in, sync with Supabase
    refreshUser();
  }, [auth0User, isAuth0Loading, isAuthenticated, refreshUser]);

  // Handle navigation logic based on user state
  useEffect(() => {
    if (isAuth0Loading || isLoadingUser) return;

    // If user is not signed in, allow them to access public routes
    if (!isAuthenticated || !auth0User) {
      const publicRoutes = ['/', '/signin', '/signup', '/reset-password'];
      if (!publicRoutes.includes(location.pathname)) {
        navigate('/signin', { replace: true });
      }
      return;
    }

    // User is signed in but doesn't have a Supabase user record
    if (!supabaseUser) {
      // This shouldn't happen with our sync logic, but handle gracefully
      console.warn('Auth0 user exists but no Supabase user found');
      return;
    }

    // User exists in Supabase - handle routing based on their plan status
    const currentPath = location.pathname;

    // NOTE: We used to unconditionally redirect users with no plan to
    // `/pricing`. That made it impossible to show the Title page first and
    // also forced existing users into the pricing flow on sign-in. The new
    // behavior keeps the App responsible for navigating to `/pricing` only
    // when explicitly requested (e.g. after first-time signup or an Upgrade
    // button click). Do not auto-redirect here.

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
