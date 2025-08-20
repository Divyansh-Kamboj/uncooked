import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { BookOpen, Lock, Sparkles } from 'lucide-react';

interface QuestionsLimitPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  planType: string;
  maxQuestions: number;
}

export const QuestionsLimitPopup: React.FC<QuestionsLimitPopupProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  planType,
  maxQuestions
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[500px] bg-gradient-to-r from-orange-50/80 to-yellow-50/80 border-orange-200/50 shadow-xl backdrop-blur-sm">
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <BookOpen className="h-16 w-16 text-orange-500" />
              <Lock className="h-8 w-8 text-orange-600 absolute -bottom-1 -right-1" />
            </div>
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-orange-800">
            Daily Limit Reached! 📚
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base leading-relaxed text-gray-700">
            You've completed all <span className="font-semibold text-orange-600">{maxQuestions} questions</span> for today on your {' '}
            <span className="font-semibold capitalize text-orange-700">{planType} plan</span>.
            <br /><br />
            <span className="text-sm text-orange-600">
              Upgrade your plan to access more questions and keep your learning momentum going!
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 bg-white/90 border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700 transition-all duration-200"
          >
            Maybe Tomorrow
          </Button>
          <Button 
            onClick={onUpgrade}
            className="flex-1 bg-white/90 border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-500 hover:text-white hover:border-orange-500 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
