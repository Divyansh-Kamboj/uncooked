import { useState } from "react";
import { RotateCcw, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { SessionToast } from "../ui/session-toast";
import { useAuth0 } from "@auth0/auth0-react";

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
  
  const { user } = useAuth0();
  const userPlan = user?.publicMetadata?.plan as string || 'free';
  
  const handleEndSession = async () => {
    // Determine if user is "cooked" based on plan and cooked counter
    let isCooked = false;
    let showUpgrade = false;
    
    if (userPlan === 'free' || userPlan === 'nerd') {
      // For Free and Nerd plans: check against their respective limits
      const planLimit = userPlan === 'free' ? 5 : 10;
      isCooked = cookedCounter >= planLimit;
      showUpgrade = userPlan === 'free' && isCooked;
    } else if (userPlan === 'uncooked') {
      // For Uncooked plan: use 10 as the threshold
      isCooked = cookedCounter >= 10;
      showUpgrade = false; // Uncooked plan users don't need upgrade
    }
    
    // Always show the popup when ending session
    setShowToast({
      isCooked,
      showUpgrade,
      showQuestionLimit: false // This is for AI explanations, not session end
    });
    
    // Call the original onEndSession with toast handler
    await onEndSession((isCooked, showUpgrade) => {
      // This callback is called by the Dashboard's handleEndSession
      // We don't need to set showToast again here since we already set it above
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