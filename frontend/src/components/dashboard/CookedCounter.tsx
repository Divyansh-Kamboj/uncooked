import { Progress } from "@/components/ui/progress";

interface CookedCounterProps {
  cookedCounter: number;
  userPlan: string;
  progressBarColor: string;
}

export const CookedCounter = ({ cookedCounter, userPlan, progressBarColor }: CookedCounterProps) => {
  const getMaxValue = (plan: string) => {
    const thresholds = { basic: 5, nerd: 10, uncooked: 10 };
    return thresholds[plan as keyof typeof thresholds] || 10;
  };

  const maxValue = getMaxValue(userPlan);
  const progressPercentage = (cookedCounter / maxValue) * 100;

  return (
    <div className="absolute right-0 flex items-center space-x-3">
      <div className="text-sm font-semibold text-orange-800 flex items-center gap-2">
        <span>Cooked Counter:</span>
        <span className="text-lg font-bold text-orange-600">{cookedCounter}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Progress 
          value={progressPercentage} 
          className="w-32 h-3 bg-orange-100 border border-orange-200 rounded-full overflow-hidden shadow-inner"
          style={{
            '--progress-color': progressBarColor
          } as React.CSSProperties}
        />
        <div className={`text-xl transition-all duration-300 ${progressPercentage > 80 ? 'animate-pulse scale-110' : ''}`}>
          🔥
        </div>
      </div>
    </div>
  );
};