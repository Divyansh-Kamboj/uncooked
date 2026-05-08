"use client";

import { useEffect } from "react";

interface NavControlsProps {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onRevealAnswer: () => void;
}

export function NavControls({
  currentIndex,
  total,
  onPrev,
  onNext,
  onRevealAnswer,
}: NavControlsProps) {
  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't interfere with form inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
      if (e.key === " ") {
        e.preventDefault();
        onRevealAnswer();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPrev, onNext, onRevealAnswer]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < total - 1;

  return (
    <div className="flex items-center justify-between">
      {/* Prev */}
      <button
        onClick={onPrev}
        disabled={!hasPrev}
        className="inline-flex items-center gap-2 rounded-lg border border-[#222222] bg-[#111111] px-4 py-2.5 text-sm font-medium text-[#A1A1AA] transition-colors hover:border-[#444444] hover:text-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Previous question"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Previous
      </button>

      {/* Position indicator */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium text-[#FAFAFA]">
          Question {currentIndex + 1} <span className="text-[#71717A]">of {total}</span>
        </span>
        {/* Progress bar */}
        <div className="h-1 w-32 rounded-full bg-[#222222]">
          <div
            className="h-1 rounded-full bg-[#F97316] transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Next */}
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="inline-flex items-center gap-2 rounded-lg border border-[#222222] bg-[#111111] px-4 py-2.5 text-sm font-medium text-[#A1A1AA] transition-colors hover:border-[#444444] hover:text-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Next question"
      >
        Next
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
