import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
type UserProfile = Database["public"]["Tables"]["users"]["Row"];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  showError: (msg: string) => void;
  showSuccess: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { useToast } from "@/hooks/use-toast";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const showError = (msg: string) => toast({ title: "Error", description: msg, variant: "destructive" });
  const showSuccess = (msg: string) => toast({ title: "Success", description: msg });

  // Ensures a user profile exists in the users table for the given user
const ensureUserProfile = async (user: User) => {
  if (!user?.id) return;
  // Check if user profile exists
  const { data: existing, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single();
  if (!existing) {
    // Insert new user profile row
    await supabase.from('users').insert([
      {
        id: user.id,
        email: user.email,
        plan: null,
        paid: false,
        created_at: new Date().toISOString(),
      },
    ]);
  }
};

const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile({
        id: data.id,
        email: data.email,
        plan: data.plan,
        paid: data.paid,
        created_at: data.created_at,
      });
      // Redirect logic based on plan status
      if (location.pathname === '/' && data.plan) {
        navigate('/dashboard', { replace: true });
      } else if (location.pathname === '/' && !data.plan) {
        navigate('/pricing', { replace: true });
      } else if (location.pathname === '/pricing' && data.plan) {
        navigate('/dashboard', { replace: true });
      } else if (location.pathname === '/dashboard' && !data.plan) {
        navigate('/pricing', { replace: true });
      }
      return data;
    } catch (error: any) {
      setProfile(null);
      showError(error?.message || "Failed to fetch user profile");
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await ensureUserProfile(session.user);
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
            await ensureUserProfile(session.user);
            await fetchUserProfile(session.user.id);
          } else {
          setProfile(null);
          if (location.pathname !== '/') {
            navigate('/', { replace: true });
          }
        }
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    navigate('/', { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
        showError,
        showSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
