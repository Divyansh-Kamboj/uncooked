// Simplified Profile Hook (No Backend - Profiles Table Removed)
import { useState } from 'react';

interface Profile {
  id: string;
  email: string | null;
  plan: string;
  created_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>({
    id: '1',
    email: 'user@example.com',
    plan: 'basic',
    created_at: '2024-01-15'
  });
  const [loading, setLoading] = useState(false);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    
    // Simulate API call - no backend functionality
    setTimeout(() => {
      const mockProfile = {
        id: userId,
        email: 'user@example.com',
        plan: 'basic',
        created_at: '2024-01-15'
      };
      setProfile(mockProfile);
      setLoading(false);
    }, 500);
    
    return profile;
  };

  const createProfile = async (userId: string, email: string) => {
    setLoading(true);
    
    // Simulate API call - no backend functionality
    setTimeout(() => {
      const mockProfile = {
        id: userId,
        email,
        plan: 'basic',
        created_at: new Date().toISOString()
      };
      setProfile(mockProfile);
      setLoading(false);
    }, 500);
    
    return profile;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    setLoading(true);
    
    // Simulate API call - no backend functionality
    setTimeout(() => {
      if (profile) {
        const updatedProfile = { ...profile, ...updates };
        setProfile(updatedProfile);
      }
      setLoading(false);
    }, 500);
    
    return profile;
  };

  return {
    profile,
    loading,
    fetchProfile,
    createProfile,
    updateProfile,
  };
};