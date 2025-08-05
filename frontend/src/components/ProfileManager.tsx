// ProfileManager is now a passthrough component. All profile logic is handled by AuthContext.

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ProfileManagerProps {
  children: React.ReactNode;
}

export const ProfileManager = ({ children }: ProfileManagerProps) => {
  return <>{children}</>;
};