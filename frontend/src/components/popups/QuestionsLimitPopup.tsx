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
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <BookOpen className="h-16 w-16 text-blue-500" />
              <Lock className="h-8 w-8 text-red-500 absolute -bottom-1 -right-1" />
            </div>
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-blue-600">
            Daily Limit Reached! 📚
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base leading-relaxed">
            You've completed all <span className="font-semibold text-blue-600">{maxQuestions} questions</span> for today on your {' '}
            <span className="font-semibold capitalize">{planType} plan</span>.
            <br /><br />
            <span className="text-sm text-gray-600">
              Upgrade your plan to access more questions and keep your learning momentum going!
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 hover:bg-gray-50"
          >
            Maybe Tomorrow
          </Button>
          <Button 
            onClick={onUpgrade}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
