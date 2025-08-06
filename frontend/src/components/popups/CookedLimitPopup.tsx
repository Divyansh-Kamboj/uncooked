import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Flame, Zap } from 'lucide-react';

interface CookedLimitPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueWithoutExplanations: () => void;
  onUpgrade: () => void;
  planType: string;
  maxExplanations: number;
}

export const CookedLimitPopup: React.FC<CookedLimitPopupProps> = ({
  isOpen,
  onClose,
  onContinueWithoutExplanations,
  onUpgrade,
  planType,
  maxExplanations
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Flame className="h-16 w-16 text-orange-500 animate-pulse" />
              <Zap className="h-8 w-8 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
            </div>
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-orange-600">
            You're Cooked! 🔥
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base leading-relaxed">
            You've used all <span className="font-semibold text-orange-600">{maxExplanations} AI explanations</span> for today on your {' '}
            <span className="font-semibold capitalize">{planType} plan</span>.
            <br /><br />
            <span className="text-sm text-gray-600">
              Upgrade your plan to get unlimited AI explanations and keep learning without limits!
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button 
            variant="outline" 
            onClick={onContinueWithoutExplanations}
            className="flex-1 hover:bg-gray-50"
          >
            Continue Without Explanations
          </Button>
          <Button 
            onClick={onUpgrade}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
          >
            🚀 Upgrade Now
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
