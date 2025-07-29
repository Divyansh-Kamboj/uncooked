// Step 4: Authentication State Cleanup Utility
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const clearAuthState = useCallback(() => {
    setSession(null);
    setUser(null);
    setLoading(false);
  }, []);

  const showError = useCallback((title: string, description: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  }, [toast]);

  const showSuccess = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
    });
  }, [toast]);

  // Clean up corrupted localStorage
  const cleanupAuthStorage = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      const authKeys = keys.filter(key => 
        key.includes('supabase') || 
        key.includes('auth') || 
        key.includes('token')
      );
      authKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to cleanup auth storage:', error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      cleanupAuthStorage();
      await supabase.auth.signOut();
      clearAuthState();
    } catch (error) {
      console.error('Sign out error:', error);
      clearAuthState(); // Clear state even if signOut fails
    }
  }, [cleanupAuthStorage, clearAuthState]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        cleanupAuthStorage();
        clearAuthState();
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_OUT') {
          clearAuthState();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [clearAuthState, cleanupAuthStorage]);

  return {
    session,
    user,
    loading,
    signOut,
    showError,
    showSuccess,
    cleanupAuthStorage,
  };
};