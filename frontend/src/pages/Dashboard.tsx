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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-6 relative">
      {/* Header Section */}
      <HeaderSection 
        cookedCounter={limitStatus.aiExplanationsUsed}
        userPlan={userPlan}
        progressBarColor={progressBarColor}
      />

      {/* Filter Bar */}
      <FilterBar 
        filters={filters}
        setFilters={setFilters}
        onSubmit={handleSubmit}
      />

      {/* Main Content Area */}
      <div className="flex flex-col items-center space-y-8">
        {/* Question and AI Explanation Layout */}
        <div className="flex flex-col lg:flex-row items-center gap-14 w-full max-w-[1800px] mx-auto px-4 lg:ml-12">
          {/* Question Viewer - flexible width with reasonable limits */}
          <div className={`transition-all duration-700 ease-in-out transform relative ${
            showAIExplanation 
              ? 'lg:flex-[2] lg:min-w-[500px] lg:max-w-[900px]' 
              : 'lg:flex-1 lg:max-w-6xl lg:mx-auto'
          } w-full flex justify-center`}>
            <QuestionViewer 
              paperLoaded={paperLoaded}
              currentQuestion={currentQuestion}
              showMarkScheme={showMarkScheme}
              onPreviousQuestion={handlePreviousQuestion}
              onNextQuestion={handleNextQuestion}
              questions={questions}
              totalQuestions={questions.length}
            />
            {isLoadingUser && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-white/90 px-4 py-2 rounded-full shadow-md">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                <span className="text-sm font-medium text-gray-700">Loading question...</span>
              </div>
            )}
          </div>

          {/* AI Explanation Container */}
          <div className={`transition-all duration-700 ease-in-out transform ${
            showAIExplanation 
              ? 'w-full lg:flex-[1] lg:min-w-[400px] lg:max-w-[600px] opacity-100 translate-x-0 scale-100' 
              : 'w-0 lg:flex-[0] lg:min-w-[0px] lg:max-w-[0px] opacity-0 translate-x-full scale-95 pointer-events-none overflow-hidden'
          } flex justify-center`}>
            <AIExplanation 
              isVisible={showAIExplanation} 
              explanation={questions[currentQuestion - 1]?.ai_explanation}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <ActionButtons 
          paperLoaded={paperLoaded}
          showMarkScheme={showMarkScheme}
          onToggleMarkScheme={() => setShowMarkScheme(!showMarkScheme)}
          onAIExplanation={handleAIExplanation}
          aiExplanationDisabled={limitStatus.aiExplanationsLimitReached}
          aiExplanationsRemaining={limitStatus.aiExplanationsRemaining}
        />
      </div>

      {/* Session Controls */}
      <SessionControls 
        onRestartSession={handleRestartSession}
        onEndSession={handleEndSession}
        cookedCounter={limitStatus.aiExplanationsUsed}
        maxCookedCount={planLimits.aiExplanations}
        usedAiExplanations={limitStatus.aiExplanationsUsed}
        maxAiExplanations={planLimits.aiExplanations}
      />

      {/* Limit Popups */}
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