import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { 
  getUserDailyUsage, 
  incrementQuestionUsage, 
  incrementAIExplanationUsage,
  DailyUsage 
} from '@/lib/usageTracking';

export const useUsageTracking = () => {
  const { supabaseUser, refreshUser } = useAuth();
  const [dailyUsage, setDailyUsage] = useState<DailyUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial usage data
  useEffect(() => {
    const fetchUsage = async () => {
      if (!supabaseUser) {
        setDailyUsage(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const usage = await getUserDailyUsage(supabaseUser.id);
      setDailyUsage(usage);
      setIsLoading(false);
    };

    fetchUsage();
  }, [supabaseUser]);

  // Function to increment question usage
  const incrementQuestions = async (): Promise<boolean> => {
    if (!supabaseUser) return false;

    const updatedUsage = await incrementQuestionUsage(supabaseUser.id);
    if (updatedUsage) {
      setDailyUsage(updatedUsage);
      // Also refresh user data to sync with AuthProvider
      await refreshUser();
      return true;
    }
    return false;
  };

  // Function to increment AI explanation usage
  const incrementAIExplanations = async (): Promise<boolean> => {
    if (!supabaseUser) return false;

    const updatedUsage = await incrementAIExplanationUsage(supabaseUser.id);
    if (updatedUsage) {
      setDailyUsage(updatedUsage);
      // Also refresh user data to sync with AuthProvider
      await refreshUser();
      return true;
    }
    return false;
  };

  // Function to refresh usage data
  const refreshUsage = async () => {
    if (!supabaseUser) return;
    
    const usage = await getUserDailyUsage(supabaseUser.id);
    setDailyUsage(usage);
  };

  return {
    dailyUsage,
    isLoading,
    incrementQuestions,
    incrementAIExplanations,
    refreshUsage
  };
};
