import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { QuestionViewer } from "@/components/dashboard/QuestionViewer";
import { ActionButtons } from "@/components/dashboard/ActionButtons";
import { SessionControls } from "@/components/dashboard/SessionControls";
import { HeaderSection } from "@/components/dashboard/HeaderSection";
import { AIExplanation } from "@/components/dashboard/AIExplanation";
import { useQuestions } from "@/hooks/useQuestions";

// Color interpolation utility function
const interpolateColor = (cookedCounter: number, userPlan: string) => {
  const thresholds = {
    basic: 5,
    nerd: 10,
    uncooked: 10
  };
  
  const threshold = thresholds[userPlan as keyof typeof thresholds] || 10;
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
  const [showMarkScheme, setShowMarkScheme] = useState(false);
  const [showAIExplanation, setShowAIExplanation] = useState(false);
  const [cookedCounter, setCookedCounter] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [paperLoaded, setPaperLoaded] = useState(false);
  const [userPlan] = useState("basic"); // Default plan - can be changed based on user data
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
  const progressBarColor = interpolateColor(cookedCounter, userPlan);
  
  // Calculate max value for progress bar based on plan
  const getMaxValue = (plan: string) => {
    const thresholds = { basic: 5, nerd: 10, uncooked: 10 };
    return thresholds[plan as keyof typeof thresholds] || 10;
  };

  const handleSubmit = () => {
    setPaperLoaded(true);
    setCurrentQuestion(1);
    setShowMarkScheme(false);
    // Mock paper loading logic
    console.log("Paper loaded with filters:", filters);
  };

  const handleAIExplanation = () => {
    setCookedCounter(prev => prev + 1);
    setShowAIExplanation(true);
    // Mock AI explanation logic
    console.log("AI Explanation requested");
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestion(prev => Math.max(1, prev - 1));
    setShowMarkScheme(false);
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(prev => Math.min(prev + 1, questions.length));
    setShowMarkScheme(false);
    setShowAIExplanation(false);
  };

  const handleEndSession = () => {
    // Navigate to end session page with current state
    navigate("/end-session", { 
      state: { 
        cookedCounter, 
        userPlan 
      } 
    });
  };

  const handleRestartSession = () => {
    setCookedCounter(0);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-6">
      {/* Header Section */}
      <HeaderSection 
        cookedCounter={cookedCounter}
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
        />
      </div>

      {/* Session Controls */}
      <SessionControls 
        onRestartSession={handleRestartSession}
        onEndSession={handleEndSession}
      />
    </div>
  );
};

export default Dashboard;