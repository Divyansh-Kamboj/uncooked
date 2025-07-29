// Step 3: Separate Profile Management Component
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface ProfileManagerProps {
  children: React.ReactNode;
}

export const ProfileManager = ({ children }: ProfileManagerProps) => {
  const { user, showError, showSuccess } = useAuth();
  const { profile, createProfile } = useProfile();

  useEffect(() => {
    // Auto-create profile for new users
    if (user && !profile) {
      const createUserProfile = async () => {
        try {
          const newProfile = await createProfile(user.id, user.email || '');
          if (newProfile) {
            showSuccess('Welcome to Uncooked!', 'Your profile has been created.');
          }
        } catch (error) {
          console.error('Failed to create profile:', error);
          showError('Profile Creation Failed', 'Unable to create your profile. Please try again.');
        }
      };

      createUserProfile();
    }
  }, [user, profile, createProfile, showError, showSuccess]);

  return <>{children}</>;
};