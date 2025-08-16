import { useState } from "react";
import { RotateCcw, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { SessionToast } from "../ui/session-toast";
import { useUser } from "@clerk/clerk-react";

interface SessionControlsProps {
  onRestartSession: () => void;
  onEndSession: (showToast: (isCooked: boolean, showUpgrade?: boolean) => void) => Promise<void>;
  cookedCounter: number;
  maxCookedCount: number;
  usedAiExplanations: number;
  maxAiExplanations: number;
}

export const SessionControls = ({
  onRestartSession,
  onEndSession,
  cookedCounter,
  maxCookedCount,
  usedAiExplanations,
  maxAiExplanations
}: SessionControlsProps) => {
  const [showToast, setShowToast] = useState<{
    isCooked: boolean;
    showUpgrade: boolean;
    showQuestionLimit: boolean;
  } | null>(null);
  
  const { user } = useUser();
  const userPlan = user?.publicMetadata?.plan as string || 'free';
  
  const handleEndSession = async () => {
    const isCooked = cookedCounter >= maxCookedCount;
    const isAiLimitReached = usedAiExplanations >= maxAiExplanations;
    // Only show upgrade message for free plan users
    const showUpgrade = userPlan === 'free' && (isCooked || isAiLimitReached);
    
    // Show toast if needed
    if (isCooked || isAiLimitReached) {
      setShowToast({
        isCooked,
        showUpgrade: userPlan === 'free' && showUpgrade, // Double check it's free plan
        showQuestionLimit: isAiLimitReached
      });
    }
    
    // Call the original onEndSession with toast handler
    await onEndSession((isCooked, showUpgrade) => {
      setShowToast({ 
        isCooked, 
        showUpgrade: userPlan === 'free' && showUpgrade, // Double check it's free plan
        showQuestionLimit: false 
      });
    });
  };
  return (
    <>
      {/* Restart Session Button */}
      <Button
        variant="outline"
        onClick={onRestartSession}
        className="fixed bottom-6 left-6 h-14 px-6 rounded-full border-2 border-orange-300 bg-white/90 hover:bg-orange-50 text-orange-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 backdrop-blur-sm"
      >
        <RotateCcw className="h-5 w-5 mr-2" />
        <span>Restart Session</span>
      </Button>

      {/* End Session Button */}
      <Button
        variant="outline"
        onClick={handleEndSession}
        className="fixed bottom-6 right-6 h-14 px-6 rounded-full border-2 border-red-300 bg-white/90 hover:bg-red-50 text-red-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 backdrop-blur-sm"
      >
        <LogOut className="h-5 w-5 mr-2" />
        <span>End Session</span>
      </Button>

      {/* Session End Toast */}
      {showToast && (
        <SessionToast
          type={showToast.isCooked ? 'cooked' : 'uncooked'}
          onStartNewSession={() => {
            setShowToast(null);
            onRestartSession();
          }}
          onViewStats={() => {
            setShowToast(null);
            // Stats page navigation will be handled by the toast
          }}
          showUpgrade={showToast.showUpgrade}
          showQuestionLimit={showToast.showQuestionLimit}
        />
      )}
    </>
  );
};