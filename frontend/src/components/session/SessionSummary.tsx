"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";

interface SessionSummaryProps {
  open: boolean;
  onClose: () => void;
  viewedCount: number;
  totalCount: number;
  onStartOver: () => void;
}

export function SessionSummary({
  open,
  onClose,
  viewedCount,
  totalCount,
  onStartOver,
}: SessionSummaryProps) {
  const router = useRouter();

  const handleGoHome = () => {
    onClose();
    router.push("/practice");
  };

  const getMessage = () => {
    if (viewedCount === 0) return "You haven't viewed any questions yet.";
    if (viewedCount === 1) return "You practised 1 question. Good start!";
    if (viewedCount < 5) return `You practised ${viewedCount} questions. Good start!`;
    if (viewedCount < 10) return `You practised ${viewedCount} questions. Good work!`;
    if (viewedCount < 20) return `You practised ${viewedCount} questions. Solid session!`;
    return `You practised ${viewedCount} questions. Outstanding effort!`;
  };

  const pct = totalCount > 0 ? Math.round((viewedCount / totalCount) * 100) : 0;

  return (
    <Modal open={open} onClose={onClose} title="Session complete">
      <div className="flex flex-col gap-6">
        {/* Stats */}
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[#222222] bg-[#0A0A0A] p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F97316]/10 border border-[#F97316]/20">
            <span className="text-2xl font-bold text-[#F97316]">{viewedCount}</span>
          </div>
          <p className="text-center text-sm text-[#A1A1AA]">{getMessage()}</p>

          {/* Progress ring */}
          {totalCount > 0 && (
            <div className="w-full">
              <div className="mb-1 flex items-center justify-between text-xs text-[#71717A]">
                <span>Session progress</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#222222]">
                <div
                  className="h-1.5 rounded-full bg-[#F97316] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs text-[#71717A]">
                {viewedCount} of {totalCount}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleGoHome}
            className="flex-1 rounded-lg border border-[#222222] bg-[#1A1A1A] py-2.5 text-sm font-medium text-[#A1A1AA] transition-colors hover:bg-[#222222] hover:text-[#FAFAFA]"
          >
            Go home
          </button>
          <button
            onClick={() => {
              onStartOver();
              onClose();
            }}
            className="flex-1 rounded-lg bg-[#F97316] py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#EA6C0A]"
          >
            Start over
          </button>
        </div>
      </div>
    </Modal>
  );
}
