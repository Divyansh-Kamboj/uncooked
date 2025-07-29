import { RotateCcw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionControlsProps {
  onRestartSession: () => void;
  onEndSession: () => void;
}

export const SessionControls = ({ onRestartSession, onEndSession }: SessionControlsProps) => {
  return (
    <>
      {/* Restart Session Button */}
      <Button
        variant="outline"
        onClick={onRestartSession}
        className="fixed bottom-6 left-6 h-14 px-6 rounded-full border-2 border-orange-300 bg-white/90 hover:bg-orange-50 text-orange-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 backdrop-blur-sm"
      >
        <RotateCcw className="h-5 w-5 mr-2" />
        <span>Restart Session</span>
      </Button>

      {/* End Session Button */}
      <Button
        variant="outline"
        onClick={onEndSession}
        className="fixed bottom-6 right-6 h-14 px-6 rounded-full border-2 border-red-300 bg-white/90 hover:bg-red-50 text-red-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 backdrop-blur-sm"
      >
        <LogOut className="h-5 w-5 mr-2" />
        <span>End Session</span>
      </Button>
    </>
  );
};