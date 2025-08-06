import { useMemo } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getPlanLimits } from '@/config/planLimits';
import { useUsageTracking } from './useUsageTracking';

export const usePlanLimits = () => {
  const { supabaseUser } = useAuth();
  const { dailyUsage } = useUsageTracking();

  const planLimits = useMemo(() => {
    return getPlanLimits(supabaseUser?.plan || 'free');
  }, [supabaseUser?.plan]);

  const limitStatus = useMemo(() => {
    if (!dailyUsage) {
      return {
        questionsUsed: 0,
        aiExplanationsUsed: 0,
        questionsRemaining: planLimits.dailyQuestions === -1 ? -1 : planLimits.dailyQuestions,
        aiExplanationsRemaining: planLimits.aiExplanations === -1 ? -1 : planLimits.aiExplanations,
        questionsLimitReached: false,
        aiExplanationsLimitReached: false,
        isUnlimited: supabaseUser?.plan === 'uncooked'
      };
    }

    const questionsRemaining = planLimits.dailyQuestions === -1 
      ? -1 
      : Math.max(0, planLimits.dailyQuestions - dailyUsage.daily_questions_used);

    const aiExplanationsRemaining = planLimits.aiExplanations === -1 
      ? -1 
      : Math.max(0, planLimits.aiExplanations - dailyUsage.daily_ai_explanations_used);

    return {
      questionsUsed: dailyUsage.daily_questions_used,
      aiExplanationsUsed: dailyUsage.daily_ai_explanations_used,
      questionsRemaining,
      aiExplanationsRemaining,
      questionsLimitReached: planLimits.dailyQuestions !== -1 && dailyUsage.daily_questions_used >= planLimits.dailyQuestions,
      aiExplanationsLimitReached: planLimits.aiExplanations !== -1 && dailyUsage.daily_ai_explanations_used >= planLimits.aiExplanations,
      isUnlimited: supabaseUser?.plan === 'uncooked'
    };
  }, [dailyUsage, planLimits, supabaseUser?.plan]);

  return {
    planLimits,
    limitStatus,
    userPlan: supabaseUser?.plan || 'free'
  };
};
