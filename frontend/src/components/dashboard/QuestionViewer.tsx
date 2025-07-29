import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Question {
  id: number;
  question_img: string | null;
  answer_img: string | null;
  question_number: string | null;
}

interface QuestionViewerProps {
  paperLoaded: boolean;
  currentQuestion: number;
  showMarkScheme: boolean;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  questions: Question[];
  totalQuestions: number;
}

export const QuestionViewer = ({ 
  paperLoaded, 
  currentQuestion, 
  showMarkScheme, 
  onPreviousQuestion, 
  onNextQuestion,
  questions,
  totalQuestions
}: QuestionViewerProps) => {
  const currentQuestionData = questions[currentQuestion - 1];
  
  const parseImageUrls = (imageString: string | null): string[] => {
    if (!imageString) return [];
    try {
      // Try to parse as JSON array first
      return JSON.parse(imageString);
    } catch {
      // If not JSON, treat as single URL
      return [imageString];
    }
  };

  const renderImages = (imageUrls: string[]) => {
    if (imageUrls.length === 0) return null;

    return (
      <ScrollArea className="w-full h-full">
        <div className="space-y-4 p-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="flex justify-center">
              <img
                src={url}
                alt={`Question ${currentQuestion} - Part ${index + 1}`}
                className="w-full h-auto rounded-lg shadow-md"
                style={{ minHeight: '400px', maxHeight: 'none' }}
                onError={(e) => {
                  console.error(`Failed to load image: ${url}`);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };
  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Question Number Display */}
      {paperLoaded && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-2 rounded-full border border-orange-200">
            <span className="text-sm font-semibold text-orange-800">
              Question {currentQuestion} of {totalQuestions}
            </span>
          </div>
        </div>
      )}

      <Card className="p-12 min-h-[400px] flex items-center justify-center relative overflow-hidden shadow-lg border-orange-200/30">
        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onPreviousQuestion}
          disabled={!paperLoaded || currentQuestion <= 1}
        >
          <ChevronLeft className="h-6 w-6 text-orange-600" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNextQuestion}
          disabled={!paperLoaded || currentQuestion >= totalQuestions}
        >
          <ChevronRight className="h-6 w-6 text-orange-600" />
        </Button>

        {/* Question/Answer Content */}
        <div className="w-full max-w-4xl mx-auto">
          {!paperLoaded ? (
            <div className="h-96 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl flex items-center justify-center border border-orange-200/50 shadow-inner">
              <div className="text-center space-y-4">
                <div className="text-8xl mb-6 animate-pulse">📚</div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-orange-800">Ready to Cook! 🔥</p>
                  <p className="text-lg text-orange-600 font-medium">Let's get started</p>
                  <p className="text-sm text-orange-500 max-w-xs mx-auto leading-relaxed">
                    Select your paper criteria above to load questions
                  </p>
                </div>
              </div>
            </div>
          ) : totalQuestions === 0 ? (
            <div className="h-96 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl flex items-center justify-center border border-orange-200/50 shadow-inner">
              <div className="text-center space-y-4">
                <div className="text-8xl mb-6">😴</div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-orange-800">No Questions Found</p>
                  <p className="text-lg text-orange-600">Try adjusting your filters</p>
                </div>
              </div>
            </div>
          ) : (
            <div 
              key={`${currentQuestion}-${showMarkScheme}`}
              className="bg-white rounded-2xl border border-orange-200/50 shadow-inner transition-opacity duration-200 ease-in-out" 
              style={{ height: '480px' }}
            >
              {currentQuestionData ? (
                showMarkScheme ? (
                  renderImages(parseImageUrls(currentQuestionData.answer_img))
                ) : (
                  renderImages(parseImageUrls(currentQuestionData.question_img))
                )
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-8xl mb-6">❓</div>
                    <p className="text-xl font-bold text-orange-800">Question not available</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Decorative background elements */}
        <div className="absolute bottom-4 left-4 text-yellow-200 text-4xl opacity-20 select-none">✨</div>
      </Card>
    </div>
  );
};