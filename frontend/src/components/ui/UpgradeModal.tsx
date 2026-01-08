import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
  isOpen: boolean;
  mode: 'returning' | 'limit' | null;
  limitType?: 'questions' | 'ai' | null;
  onClose: () => void;
  onUpgrade: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, mode, limitType, onClose, onUpgrade }) => {
  if (!mode) return null;

  const isLimit = mode === 'limit';

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[600px] rounded-lg">
        <AlertDialogHeader className="text-center py-6 px-6">
          <AlertDialogTitle className="text-2xl font-bold text-foreground mb-2">
            {isLimit ? (
              limitType === 'ai' ? "You've run out of free AI explanations!" : "You've run out of free questions!"
            ) : (
              "Level up your learning"
            )}
          </AlertDialogTitle>

          <AlertDialogDescription className="mx-auto max-w-md text-sm text-muted-foreground">
            {isLimit ? (
              <>
                It looks like you've hit your daily {limitType === 'ai' ? 'AI explanations' : 'questions'} limit. Upgrade your plan to continue using this feature today.
              </>
            ) : (
              <>
                <div className="mb-4">
                  {/* Placeholder convincing image */}
                  <div className="w-full h-40 bg-gray-100 rounded-md flex items-center justify-center">
                    <div className="text-gray-400">[Your stats preview]</div>
                  </div>
                </div>
                Unlock Pro to get unlimited access and make the most of your study sessions.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            {isLimit ? 'Maybe Later' : 'Not Now'}
          </Button>
          <AlertDialogAction asChild>
            <Button onClick={onUpgrade} className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white">
              {isLimit ? 'Upgrade to Continue' : 'Upgrade Now'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UpgradeModal;
