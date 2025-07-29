import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  paperLoaded: boolean;
  showMarkScheme: boolean;
  onToggleMarkScheme: () => void;
  onAIExplanation: () => void;
}

export const ActionButtons = ({ 
  paperLoaded, 
  showMarkScheme, 
  onToggleMarkScheme, 
  onAIExplanation 
}: ActionButtonsProps) => {
  const [isAILoading, setIsAILoading] = useState(false);

  const handleAIExplanation = async () => {
    setIsAILoading(true);
    onAIExplanation();
    // Simulate loading time
    setTimeout(() => setIsAILoading(false), 2000);
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
      
      <Button
        variant="default"
        onClick={handleAIExplanation}
        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        disabled={!paperLoaded || isAILoading}
      >
        <span className="flex items-center gap-2">
          {isAILoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Cooking up explanation...
            </>
          ) : (
            <>
              🤖 AI Explanation
            </>
          )}
        </span>
      </Button>
    </div>
  );
};