// Step 3: Separate Profile Management System
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  email: string | null;
  plan: string;
  created_at: string;
}

export const useProfile = () => {
  const { user, showError } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
      return data;
    } catch (error: unknown) {
      console.error('Profile fetch error:', error);
      showError('Profile Error', 'Failed to load profile data');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (userId: string, email: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          email,
          plan: 'basic'
        })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return data;
    } catch (error: unknown) {
      console.error('Profile creation error:', error);
      showError('Profile Creation Error', 'Failed to create profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return data;
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      showError('Profile Update Error', 'Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [user, fetchProfile]);

  return {
    profile,
    loading,
    fetchProfile,
    createProfile,
    updateProfile,
  };
};