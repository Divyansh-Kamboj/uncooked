import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EndSessionState {
  cookedCounter: number;
  userPlan: string;
}

export const EndSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  
  // Get data from navigation state
  const { cookedCounter, userPlan } = (location.state as EndSessionState) || { cookedCounter: 0, userPlan: "Basic" };

  // Determine if user is cooked based on plan and counter
  const isCooked = () => {
    if (userPlan === "basic") {
      return cookedCounter >= 3;
    } else {
      // Nerd & Uncooked plans
      return cookedCounter >= 5;
    }
  };

  const cooked = isCooked();

  // Animation effect for slide-up
  useEffect(() => {
    // Trigger slide-up animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleStartNewSession = () => {
    // Navigate back to dashboard with reset flag
    navigate('/dashboard', { state: { reset: true } });
  };

  const handleFeedback = () => {
    window.location.href = "mailto:uncookeddr@gmail.com";
  };

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-700 ease-out transform font-inter ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      } ${
        cooked 
          ? 'bg-[#FF4900]' // Red background for cooked
          : 'bg-[#62D7E7]' // Blue background for uncooked
      }`}
    >
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        {/* Main Status Text */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
          {cooked ? "You're Cooked 🔥" : "You're Uncooked 🥶"}
        </h1>

        {/* Funny Phrase */}
        <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-12 max-w-2xl animate-fade-in" style={{ animationDelay: '200ms' }}>
          {cooked 
            ? "Looks like you've been in the pan too long! Time to cool down and try again."
            : "Looks like you're still fresh out of the oven! Keep that brain raw!"
          }
        </p>

        {/* Action Button */}
        <Button
          onClick={handleStartNewSession}
          className="mb-8 h-14 px-8 text-lg font-semibold rounded-full bg-white text-gray-900 hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-lg animate-fade-in"
          style={{ animationDelay: '400ms' }}
        >
          {cooked ? "Try again?" : "Start a new session"}
        </Button>

        {/* Feedback Button */}
        <button
          onClick={handleFeedback}
          className="text-white/80 hover:text-white text-sm underline transition-colors duration-200 animate-fade-in"
          style={{ animationDelay: '600ms' }}
        >
          Feedback
        </button>

        {/* Cooked counter display */}
        <div className="fixed bottom-4 left-4 text-white/60 text-xs">
          Cooked Counter: {cookedCounter}
        </div>

      </div>
    </div>
  );
};