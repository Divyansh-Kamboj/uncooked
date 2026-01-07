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
import UpgradeModal from "@/components/ui/UpgradeModal";
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
  const [upgradeModal, setUpgradeModal] = useState<{ isOpen: boolean; mode: 'returning' | 'limit' | null; limitType?: 'questions' | 'ai' | null }>({ isOpen: false, mode: null });
  
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
      setUpgradeModal({ isOpen: true, mode: 'limit', limitType: 'questions' });
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
      setUpgradeModal({ isOpen: true, mode: 'limit', limitType: 'ai' });
      return;
    }

    // Increment AI explanation usage
    const success = await incrementAIExplanations();
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to track AI explanation usage",
        variant: "destructive"
      });
      return;
    }

    setShowAIExplanation(true);
    
    toast({
      title: "🔥 You're getting cooked!",
      description: `AI explanations remaining: ${limitStatus.aiExplanationsRemaining === -1 ? "Unlimited" : limitStatus.aiExplanationsRemaining - 1}`
    });
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestion(prev => Math.max(1, prev - 1));
    setShowMarkScheme(false);
  };

  const handleNextQuestion = async () => {
    // Check if we need to increment question usage (moving to next question)
    const nextQuestionIndex = currentQuestion + 1;
    
    if (nextQuestionIndex <= questions.length) {
      // Check limits before allowing navigation to next question
      if (limitStatus.questionsLimitReached) {
        setUpgradeModal({ isOpen: true, mode: 'limit', limitType: 'questions' });
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
    const isCooked = limitStatus.aiExplanationsLimitReached;
    const showUpgrade = userPlan === 'free' && isCooked;
    
    // Show toast if needed
    if (isCooked) {
      showToast(isCooked, showUpgrade);
    }
    
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
    // Mark that the user explicitly chose to upgrade from the modal
    try { localStorage.setItem('fromUpgradeModal', 'true'); } catch(e) {}
    navigate('/pricing');
  };

  // On initial mount: if this navigation was flagged as a returning session
  // (set by Index.tsx on "Click to Start"), show the returning modal once
  useEffect(() => {
    try {
      const returningSession = sessionStorage.getItem('returningSession');
      const alreadyShown = sessionStorage.getItem('returningPromptShown');
      if (returningSession === 'true' && !alreadyShown && supabaseUser) {
        setUpgradeModal({ isOpen: true, mode: 'returning' });
        sessionStorage.setItem('returningPromptShown', 'true');
        // Clear the session marker so subsequent non-start navigations don't trigger
        sessionStorage.removeItem('returningSession');
      }
    } catch (e) {}
  // supabaseUser indicates a signed-in returning visitor
  }, [supabaseUser]);

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

  // Show loading if user data is still being fetched
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-6">
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
          <div className={`transition-all duration-500 ease-in-out ${
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
          </div>

          {/* AI Explanation Container */}
          {showAIExplanation && (
            <div className="w-full lg:flex-[1] lg:min-w-[400px] lg:max-w-[600px] flex justify-center">
              <AIExplanation 
                isVisible={showAIExplanation} 
                explanation={questions[currentQuestion - 1]?.ai_explanation}
              />
            </div>
          )}
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

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        mode={upgradeModal.mode}
        limitType={upgradeModal.limitType}
        onClose={() => setUpgradeModal({ isOpen: false, mode: null })}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
};

export default Dashboard;