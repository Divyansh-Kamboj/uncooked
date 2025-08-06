import { supabase } from '@/integrations/supabase/client';

export interface DailyUsage {
  daily_questions_used: number;
  daily_ai_explanations_used: number;
  last_reset_date: string;
}

// Check if daily counters need to be reset (new day)
export const shouldResetDaily = (lastResetDate: string): boolean => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const lastReset = lastResetDate.split('T')[0];
  return today !== lastReset;
};

// Reset daily counters for new day
export const resetDailyUsageIfNeeded = async (userId: string, currentUsage: DailyUsage) => {
  if (!shouldResetDaily(currentUsage.last_reset_date)) {
    return currentUsage; // No reset needed
  }

  const today = new Date().toISOString();
  
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        daily_questions_used: 0,
        daily_ai_explanations_used: 0,
        last_reset_date: today
      })
      .eq('id', userId)
      .select('daily_questions_used, daily_ai_explanations_used, last_reset_date')
      .single();

    if (error) {
      console.error('Error resetting daily usage:', error);
      return currentUsage; // Return current if reset fails
    }

    return data as DailyUsage;
  } catch (error) {
    console.error('Unexpected error resetting daily usage:', error);
    return currentUsage;
  }
};

// Increment question usage
export const incrementQuestionUsage = async (userId: string): Promise<DailyUsage | null> => {
  try {
    // First get current usage
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('daily_questions_used, daily_ai_explanations_used, last_reset_date')
      .eq('id', userId)
      .single();

    if (fetchError || !currentUser) {
      console.error('Error fetching current usage:', fetchError);
      return null;
    }

    // Check if we need to reset daily counters
    const resetUsage = await resetDailyUsageIfNeeded(userId, currentUser);

    // Increment question count
    const { data, error } = await supabase
      .from('users')
      .update({
        daily_questions_used: resetUsage.daily_questions_used + 1
      })
      .eq('id', userId)
      .select('daily_questions_used, daily_ai_explanations_used, last_reset_date')
      .single();

    if (error) {
      console.error('Error incrementing question usage:', error);
      return null;
    }

    return data as DailyUsage;
  } catch (error) {
    console.error('Unexpected error incrementing question usage:', error);
    return null;
  }
};

// Increment AI explanation usage
export const incrementAIExplanationUsage = async (userId: string): Promise<DailyUsage | null> => {
  try {
    // First get current usage
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('daily_questions_used, daily_ai_explanations_used, last_reset_date')
      .eq('id', userId)
      .single();

    if (fetchError || !currentUser) {
      console.error('Error fetching current usage:', fetchError);
      return null;
    }

    // Check if we need to reset daily counters
    const resetUsage = await resetDailyUsageIfNeeded(userId, currentUser);

    // Increment AI explanation count
    const { data, error } = await supabase
      .from('users')
      .update({
        daily_ai_explanations_used: resetUsage.daily_ai_explanations_used + 1
      })
      .eq('id', userId)
      .select('daily_questions_used, daily_ai_explanations_used, last_reset_date')
      .single();

    if (error) {
      console.error('Error incrementing AI explanation usage:', error);
      return null;
    }

    return data as DailyUsage;
  } catch (error) {
    console.error('Unexpected error incrementing AI explanation usage:', error);
    return null;
  }
};

// Get current daily usage (with auto-reset if needed)
export const getUserDailyUsage = async (userId: string): Promise<DailyUsage | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('daily_questions_used, daily_ai_explanations_used, last_reset_date')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching user daily usage:', error);
      return null;
    }

    // Auto-reset if needed and return updated usage
    const resetUsage = await resetDailyUsageIfNeeded(userId, data);
    return resetUsage;
  } catch (error) {
    console.error('Unexpected error fetching user daily usage:', error);
    return null;
  }
};
