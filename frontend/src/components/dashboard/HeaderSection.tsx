import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CookedCounter } from "./CookedCounter";
import { useNavigate } from "react-router-dom";

interface HeaderSectionProps {
  cookedCounter: number;
  userPlan: string;
  progressBarColor: string;
}

export const HeaderSection = ({ cookedCounter, userPlan, progressBarColor }: HeaderSectionProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="relative flex items-center justify-center mb-8">
      {/* Profile Icon */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/account')}
        className="absolute left-0 h-12 w-12 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 border border-orange-200 text-orange-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
      >
        <User className="h-6 w-6" />
      </Button>

      {/* Uncooked Logo - Centered */}
      <div className="flex items-center space-x-3">
        <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 bg-clip-text">
          Uncooked
        </h1>
        <div className="text-3xl">🔥</div>
      </div>

      {/* Cooked Counter */}
      <CookedCounter 
        cookedCounter={cookedCounter}
        userPlan={userPlan}
        progressBarColor={progressBarColor}
      />
    </div>
  );
};