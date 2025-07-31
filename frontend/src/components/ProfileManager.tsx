// Simplified Profile Manager (No Backend - Profiles Table Removed)
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface ProfileManagerProps {
  children: React.ReactNode;
}

export const ProfileManager = ({ children }: ProfileManagerProps) => {
  const { user } = useAuth();
  const { profile, createProfile } = useProfile();

  useEffect(() => {
    // Auto-create mock profile for new users
    if (user && !profile) {
      const createUserProfile = async () => {
        try {
          await createProfile(user.id, user.email || '');
        } catch (error) {
          console.error('Failed to create profile:', error);
        }
      };

      createUserProfile();
    }
  }, [user, profile, createProfile]);

  return <>{children}</>;
};