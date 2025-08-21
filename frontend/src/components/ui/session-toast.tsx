import React from 'react';
import { Check, X, Zap, AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { useNavigate } from 'react-router-dom';

interface SessionToastProps {
  type: 'cooked' | 'uncooked';
  onStartNewSession: () => void;
  onViewStats: () => void;
  showUpgrade?: boolean;
  showQuestionLimit?: boolean;
}

export const SessionToast = ({
  type,
  onStartNewSession,
  onViewStats,
  showUpgrade = false,
  showQuestionLimit = false,
}: SessionToastProps) => {
  const navigate = useNavigate();
  
  const isCooked = type === 'cooked';
  
  const handleViewStats = () => {
    onViewStats();
    // For now, navigate to dashboard (stats page not implemented yet)
    navigate('/dashboard');
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50`}>
      <div 
        className={`w-full max-w-md p-6 rounded-2xl shadow-xl ${
          isCooked ? 'bg-red-100' : 'bg-blue-100'
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`p-3 rounded-full mb-4 ${isCooked ? 'bg-red-200' : 'bg-blue-200'}`}>
            {isCooked ? (
              <span className="text-3xl">🔥</span>
            ) : (
              <span className="text-3xl">🥶</span>
            )}
          </div>
          
          <h2 className={`text-2xl font-bold mb-2 ${isCooked ? 'text-red-800' : 'text-blue-800'}`}>
            {isCooked ? "You're Cooked!" : "You're Uncooked!"}
          </h2>
          
          {showQuestionLimit ? (
            <p className="mb-6 text-gray-700">
              {isCooked 
                ? "You've used all your AI explanations for this session."
                : "You're under your cooked counter limit!"}
            </p>
          ) : (
            <p className="mb-6 text-gray-700">
              {isCooked 
                ? "You've reached your session limit!"
                : "Great job! You still have some questions left."}
            </p>
          )}
          
          {showUpgrade && (
            <div className="w-full p-3 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                {isCooked 
                  ? "Upgrade to access more AI explanations per session!"
                  : "Upgrade to access more questions!"}
              </p>
            </div>
          )}
          
          <div className="flex flex-col w-full space-y-3">
            <Button
              onClick={onStartNewSession}
              className={`w-full py-6 rounded-xl font-semibold text-lg ${
                isCooked 
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Start a New Session
            </Button>
            
            <Button
              variant="outline"
              onClick={handleViewStats}
              className="w-full py-6 rounded-xl font-semibold text-lg border-2 border-gray-300"
            >
              View Your Stats
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
