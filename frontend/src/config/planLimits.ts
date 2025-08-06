export const PLAN_LIMITS = {
  free: {
    dailyQuestions: 10,
    aiExplanations: 5,
    progressBarMax: 5
  },
  nerd: {
    dailyQuestions: 20,
    aiExplanations: 10,
    progressBarMax: 10
  },
  uncooked: {
    dailyQuestions: -1, // unlimited
    aiExplanations: -1, // unlimited
    progressBarMax: 10 // visual max, but counter continues
  }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export const getPlanLimits = (plan: PlanType | null) => {
  return PLAN_LIMITS[plan || 'free'];
};
