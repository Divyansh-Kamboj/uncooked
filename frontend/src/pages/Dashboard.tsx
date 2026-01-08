import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { QuestionViewer } from "@/components/dashboard/QuestionViewer";
import { ActionButtons } from "@/components/dashboard/ActionButtons";
import { SessionControls } from "@/components/dashboard/SessionControls";
import { HeaderSection } from "@/components/dashboard/HeaderSection";
import { AIExplanation } from "@/components/dashboard/AIExplanation";
import { useQuestions } from "@/hooks/useQuestions";
import { useAuth } from "@/components/AuthProvider";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { CookedLimitPopup } from "@/components/popups/CookedLimitPopup";
import { QuestionsLimitPopup } from "@/components/popups/QuestionsLimitPopup";
import { useToast } from "@/hooks/use-toast";
import { SessionToast } from "@/components/ui/session-toast";

// Color interpolation utility function
const interpolateColor = (cookedCounter: number, userPlan: string) => {
  const thresholds = {
    free: 5,
    nerd: 10,
    uncooked: 10
  };
  
  const threshold = thresholds[userPlan as keyof typeof thresholds] || 5;
  const progress = Math.min(cookedCounter / threshold, 1);
  
  // Start color: #62D7E7 (98, 215, 231)
  // End color: #FF4900 (255, 73, 0)
  const startR = 98, startG = 215, startB = 231;
  const endR = 255, endG = 73, endB = 0;
  
  const r = Math.round(startR + (endR - startR) * progress);
  const g = Math.round(startG + (endG - startG) * progress);
  const b = Math.round(startB + (endB - startB) * progress);
  
  return `rgb(${r}, ${g}, ${b})`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { supabaseUser, isLoadingUser } = useAuth();
  const { incrementQuestions, incrementAIExplanations } = useUsageTracking();
  const { planLimits, limitStatus, userPlan } = usePlanLimits();
  
  // UI State
  const [showMarkScheme, setShowMarkScheme] = useState(false);
  const [showAIExplanation, setShowAIExplanation] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [paperLoaded, setPaperLoaded] = useState(false);
  
  // Popup states
  const [showCookedLimitPopup, setShowCookedLimitPopup] = useState(false);
  const [showQuestionsLimitPopup, setShowQuestionsLimitPopup] = useState(false);
  
  const [filters, setFilters] = useState({
    subject: "",
    year: [] as string[],
    topic: [] as string[],
    session: [] as string[],
    difficulty: ""
  });

  // Fetch questions using the custom hook
  const { questions, loading: questionsLoading, error: questionsError } = useQuestions({
    filters,
    paperLoaded
  });

  // Calculate dynamic color for progress bar
  const progressBarColor = interpolateColor(limitStatus.aiExplanationsUsed, userPlan);
  
  // Calculate max value for progress bar based on plan
  const getMaxValue = (plan: string) => {
    const thresholds = { free: 5, nerd: 10, uncooked: 10 };
    return thresholds[plan as keyof typeof thresholds] || 5;
  };

  const handleSubmit = async () => {
    // Check if user has reached daily question limit before loading paper
    if (limitStatus.questionsLimitReached) {
      setShowQuestionsLimitPopup(true);
      return;
    }

    // Increment question usage when loading a new paper
    const success = await incrementQuestions();
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to track question usage",
        variant: "destructive"
      });
      return;
    }

    setPaperLoaded(true);
    setCurrentQuestion(1);
    setShowMarkScheme(false);
    
    toast({
      title: "Paper Loaded!",
      description: `Questions remaining: ${limitStatus.questionsRemaining === -1 ? "Unlimited" : limitStatus.questionsRemaining - 1}`
    });
  };

  const handleAIExplanation = async () => {
    // Check if user has reached AI explanation limit
    if (limitStatus.aiExplanationsLimitReached) {
      setShowCookedLimitPopup(true);
      return false;
    }

    try {
      // Increment AI explanation usage
      const success = await incrementAIExplanations();
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to track AI explanation usage",
          variant: "destructive"
        });
        return false;
      }

      setShowAIExplanation(true);
      
      toast({
        title: "🔥 You're getting cooked!",
        description: `AI explanations remaining: ${limitStatus.aiExplanationsRemaining === -1 ? "Unlimited" : limitStatus.aiExplanationsRemaining - 1}`
      });
      
      return true;
    } catch (error) {
      console.error("Error in handleAIExplanation:", error);
      return false;
    }
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestion(prev => Math.max(1, prev - 1));
    setShowMarkScheme(false);
    setShowAIExplanation(false);
  };

  const handleNextQuestion = async () => {
    // Check if we need to increment question usage (moving to next question)
    const nextQuestionIndex = currentQuestion + 1;
    
    if (nextQuestionIndex <= questions.length) {
      // Check limits before allowing navigation to next question
      if (limitStatus.questionsLimitReached) {
        setShowQuestionsLimitPopup(true);
        return;
      }

      // Increment question usage for next question
      const success = await incrementQuestions();
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to track question usage",
          variant: "destructive"
        });
        return;
      }

      setCurrentQuestion(nextQuestionIndex);
      setShowMarkScheme(false);
      setShowAIExplanation(false);
    }
  };

  const handleEndSession = async (showToast: (isCooked: boolean, showUpgrade?: boolean) => void) => {
    // The SessionControls component now handles the popup logic
    // This function is called after the popup is already shown
    // We can add any additional session ending logic here if needed
    
    // For now, we'll just return a resolved promise
    return Promise.resolve();
  };

  const handleRestartSession = useCallback(() => {
    setPaperLoaded(false);
    setCurrentQuestion(1);
    setShowMarkScheme(false);
    setShowAIExplanation(false);
    setFilters({
      subject: "",
      year: [] as string[],
      topic: [] as string[],
      session: [] as string[],
      difficulty: ""
    });
    // Note: We don't reset usage counters as they are daily limits
  }, []);

  // Handle upgrade navigation
  const handleUpgrade = () => {
    navigate('/pricing');
  };

  // Handle continue without explanations
  const handleContinueWithoutExplanations = () => {
    setShowCookedLimitPopup(false);
    // User can continue using the app but without AI explanations
    toast({
      title: "Continuing without explanations",
      description: "You can still view questions and mark schemes!"
    });
  };

  // Check if we need to reset session (coming from EndSession page)
  useEffect(() => {
    if (location.state?.reset) {
      handleRestartSession();
      // Clear the state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate, handleRestartSession]);

  return (
    <div className="min-h-screen bg-[#fff6e8] p-6">
      {/* Header: centered logo, right cooked counter */}
      <div className="max-w-[1200px] mx-auto flex items-center justify-between py-6">
        <div className="flex items-center justify-start w-1/3">
          {/* left spacer */}
        </div>
        <div className="text-center w-1/3">
          <h1 className="text-2xl font-extrabold text-[#d35400]">Uncooked <span className="text-xl">🔥</span></h1>
        </div>
        <div className="flex items-center justify-end w-1/3 space-x-4">
          <div className="text-sm text-[#c24100]">Cooked Counter</div>
          <div className="w-48 bg-white rounded-full overflow-hidden border border-orange-200 h-4">
            <div className="h-4 bg-gradient-to-r from-yellow-300 to-orange-500" style={{ width: `${Math.min((limitStatus.aiExplanationsUsed / Math.max(planLimits.aiExplanations || 1,1)) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="max-w-[1200px] mx-auto bg-white rounded-xl p-4 shadow-sm border border-orange-100 flex gap-4 items-center">
        <select className="rounded-md border border-gray-200 px-3 py-2 bg-white">
          <option>Paper(s)</option>
        </select>
        <select className="rounded-md border border-gray-200 px-3 py-2 bg-white">
          <option>Year(s)</option>
        </select>
        <select className="rounded-md border border-gray-200 px-3 py-2 bg-white">
          <option>Topic(s)</option>
        </select>
        <select className="rounded-md border border-gray-200 px-3 py-2 bg-white">
          <option>Season(s)</option>
        </select>
        <select className="rounded-md border border-gray-200 px-3 py-2 bg-white">
          <option>Difficulty</option>
        </select>
        <div className="ml-auto">
          <button onClick={handleSubmit} className="bg-[#e65a26] hover:bg-[#d14f1f] text-white px-4 py-2 rounded-md">🔍</button>
        </div>
      </div>

      {/* Main centered card */}
      <div className="max-w-[1200px] mx-auto mt-8">
        <div className="border-8 border-[#d46a00] rounded-2xl p-6">
          <div className="bg-white rounded-md h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl">📚</div>
              <h2 className="text-2xl font-bold text-[#8b2e00]">Ready to Cook! 🔥</h2>
              <p className="text-sm text-gray-600 mt-2">Select your paper criteria above to load questions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="max-w-[1200px] mx-auto mt-8 flex items-center justify-between">
        <button onClick={handleRestartSession} className="bg-white border border-orange-200 rounded-full px-4 py-2">Restart Session</button>

        <div className="flex gap-4">
          <button className="bg-[#f6a57a] rounded-full px-4 py-2">Mark Scheme</button>
          <button className="bg-[#f6b69a] rounded-full px-4 py-2">AI Explanation</button>
        </div>

        <button onClick={() => navigate('/end-session')} className="bg-white border border-orange-200 rounded-full px-4 py-2">End Session</button>
      </div>

      {/* Keep existing popups mounted for functionality */}
      <CookedLimitPopup
        isOpen={showCookedLimitPopup}
        onClose={() => setShowCookedLimitPopup(false)}
        onContinueWithoutExplanations={handleContinueWithoutExplanations}
        onUpgrade={handleUpgrade}
        planType={userPlan}
        maxExplanations={planLimits.aiExplanations}
      />

      <QuestionsLimitPopup
        isOpen={showQuestionsLimitPopup}
        onClose={() => setShowQuestionsLimitPopup(false)}
        onUpgrade={handleUpgrade}
        planType={userPlan}
        maxQuestions={planLimits.dailyQuestions}
      />
    </div>
  );
};

export default Dashboard;