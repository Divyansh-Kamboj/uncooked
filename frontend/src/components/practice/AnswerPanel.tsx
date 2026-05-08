"use client";

import { useState, useEffect } from "react";
import { parseImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Question } from "@/lib/api/questions";

interface AnswerPanelProps {
  question: Question;
}

export function AnswerPanel({ question }: AnswerPanelProps) {
  const [revealed, setRevealed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setRevealed(false);
    setImgLoaded(false);
    setImgError(false);
  }, [question.id]);

  const answerUrl = parseImageUrl(question.answer_img);

  if (!answerUrl) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-[#222222] bg-[#111111] px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#222222] bg-[#1A1A1A]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-[#FAFAFA]">Answer not yet available</p>
          <p className="mt-1 text-sm text-[#71717A]">
            Mark schemes are being added progressively. Try the AI explanation tab instead.
          </p>
        </div>
      </div>
    );
  }

  if (!revealed) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-sm text-[#71717A]">Ready to check your work?</p>
        <button
          onClick={() => setRevealed(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#EA6C0A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Reveal mark scheme
        </button>
        <p className="text-xs text-[#71717A]">Tip: press Space to reveal</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-2.5 py-0.5 text-xs font-medium text-[#22C55E]">
          Mark scheme
        </span>
      </div>

      <div className="relative rounded-xl border border-[#222222] bg-white overflow-hidden">
        {!imgLoaded && !imgError && (
          <Skeleton className="absolute inset-0 rounded-xl min-h-[200px]" />
        )}
        {imgError ? (
          <div className="flex min-h-[200px] items-center justify-center p-8">
            <p className="text-center text-sm text-[#71717A]">Failed to load mark scheme.</p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={answerUrl}
            alt="Mark scheme"
            className={`w-full h-auto transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </div>
  );
}
