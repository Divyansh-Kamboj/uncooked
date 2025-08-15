import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ActionButtonsProps {
  paperLoaded: boolean;
  showMarkScheme: boolean;
  onToggleMarkScheme: () => void;
  onAIExplanation: () => void;
  aiExplanationDisabled?: boolean;
  aiExplanationsRemaining?: number;
}

export const ActionButtons = ({ 
  paperLoaded, 
  showMarkScheme, 
  onToggleMarkScheme, 
  onAIExplanation,
  aiExplanationDisabled = false,
  aiExplanationsRemaining = -1
}: ActionButtonsProps) => {
  const [isAILoading, setIsAILoading] = useState(false);

  const handleAIExplanation = async () => {
    // Only show loading state if it's going to take a noticeable amount of time
    const loadingTimer = setTimeout(() => setIsAILoading(true), 300);
    
    try {
      await onAIExplanation();
    } finally {
      clearTimeout(loadingTimer);
      setIsAILoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
      <Button
        variant="default"
        onClick={onToggleMarkScheme}
        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        disabled={!paperLoaded}
      >
        <span className="flex items-center gap-2">
          {showMarkScheme ? "📝 Question Paper" : "📋 Mark Scheme"}
        </span>
      </Button>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            onClick={handleAIExplanation}
            className={`px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
              aiExplanationDisabled 
                ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' 
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:shadow-xl'
            } text-white`}
            disabled={!paperLoaded || isAILoading || aiExplanationDisabled}
          >
            <span className="flex items-center gap-2">
              {isAILoading ? (
                <>
                  <div className="animate-pulse">🤖</div>
                  <span className="opacity-70">Preparing explanation...</span>
                </>
              ) : aiExplanationDisabled ? (
                <span className="opacity-70">🔥 Cooked!</span>
              ) : (
                <span>🤖 AI Explanation</span>
              )}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {aiExplanationDisabled ? (
            <p>Daily AI explanation limit reached! Upgrade to get more.</p>
          ) : aiExplanationsRemaining === -1 ? (
            <p>Unlimited AI explanations remaining</p>
          ) : (
            <p>{aiExplanationsRemaining} AI explanations remaining today</p>
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};