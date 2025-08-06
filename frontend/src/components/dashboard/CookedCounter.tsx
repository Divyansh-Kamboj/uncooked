import { Progress } from "@/components/ui/progress";
import { getPlanLimits } from "@/config/planLimits";

interface CookedCounterProps {
  cookedCounter: number;
  userPlan: string;
  progressBarColor: string;
}

export const CookedCounter = ({ cookedCounter, userPlan, progressBarColor }: CookedCounterProps) => {
  const planLimits = getPlanLimits(userPlan as 'free' | 'nerd' | 'uncooked');
  const maxValue = planLimits.progressBarMax;
  
  // For uncooked plan: fill progress bar to max, then show overflow number
  const isUnlimited = userPlan === 'uncooked';
  const displayCounter = isUnlimited && cookedCounter > maxValue 
    ? `${maxValue}+ (${cookedCounter})` 
    : cookedCounter.toString();
  
  const progressPercentage = isUnlimited && cookedCounter > maxValue 
    ? 100 
    : Math.min((cookedCounter / maxValue) * 100, 100);

  return (
    <div className="absolute right-0 flex items-center space-x-3">
      <div className="text-sm font-semibold text-orange-800 flex items-center gap-2">
        <span>Cooked Counter:</span>
        <span className="text-lg font-bold text-orange-600">{displayCounter}</span>
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