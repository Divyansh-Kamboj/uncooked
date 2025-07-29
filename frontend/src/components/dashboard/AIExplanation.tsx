import { Card } from "@/components/ui/card";
import { TypingAnimation } from "./TypingAnimation";

interface AIExplanationProps {
  isVisible: boolean;
  explanation?: string | null;
}

export const AIExplanation = ({ isVisible, explanation }: AIExplanationProps) => {
  const placeholderText = "AI is cooking up an explanation for you... This will contain detailed step-by-step solutions and explanations to help you understand the mathematical concepts better. The explanation will appear here once the AI has processed your request.";
  
  const displayText = explanation || placeholderText;

  return (
    <div className={`transition-all duration-500 ease-in-out ${
      isVisible 
        ? 'opacity-100 translate-x-0 scale-100' 
        : 'opacity-0 translate-x-full scale-95 pointer-events-none'
    }`}>
      <Card className="w-full max-w-2xl p-6 bg-white/80 backdrop-blur-sm border-orange-200/50 shadow-lg">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-orange-800 flex items-center gap-2">
            🤖 AI Explanation
          </h3>
          <div className="min-h-[200px] p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200/30">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {isVisible && <TypingAnimation text={displayText} />}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};