"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Question } from "@/lib/api/questions";

interface ExplainPanelProps {
  question: Question;
  onExplanationFetched?: (id: number, explanation: string) => void;
}

export function ExplainPanel({ question, onExplanationFetched }: ExplainPanelProps) {
  const [explanation, setExplanation] = useState<string | null>(
    question.ai_explanation ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when question changes
  useEffect(() => {
    setExplanation(question.ai_explanation ?? null);
    setError(null);
    setLoading(false);
  }, [question.id, question.ai_explanation]);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: question.id }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`);
      }

      const data = (await res.json()) as { explanation: string };
      setExplanation(data.explanation);
      onExplanationFetched?.(question.id, data.explanation);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate explanation.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
          <span className="text-sm text-[#71717A]">Generating AI explanation…</span>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 p-5">
        <p className="text-sm text-[#EF4444]">{error}</p>
        <button
          onClick={fetchExplanation}
          className="self-start rounded-lg border border-[#222222] bg-[#1A1A1A] px-3 py-1.5 text-xs font-medium text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-[#222222] bg-[#111111] px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F97316]/10 border border-[#F97316]/20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-[#FAFAFA]">Get an AI explanation</p>
          <p className="mt-1 text-sm text-[#71717A]">
            Gemini will walk you through a step-by-step A-Level solution.
          </p>
        </div>
        <button
          onClick={fetchExplanation}
          className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#EA6C0A]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Generate explanation
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-[#F97316]/30 bg-[#F97316]/10 px-2.5 py-0.5 text-xs font-medium text-[#F97316]">
          AI Explanation
        </span>
        <span className="text-xs text-[#71717A]">Powered by Gemini</span>
      </div>

      {/* Explanation text, rendered with preserved whitespace */}
      <div className="rounded-xl border border-[#222222] bg-[#111111] p-5">
        <div className="prose prose-invert max-w-none">
          {explanation.split("\n").map((line, i) => {
            if (!line.trim()) return <br key={i} />;
            // Bold lines starting with ** or ## as headings
            if (line.startsWith("## ") || line.startsWith("**Step")) {
              return (
                <p key={i} className="mt-3 mb-1 font-semibold text-[#FAFAFA]">
                  {line.replace(/^##\s+/, "").replace(/\*\*/g, "")}
                </p>
              );
            }
            return (
              <p key={i} className="text-sm text-[#A1A1AA] leading-relaxed">
                {line.replace(/\*\*(.*?)\*\*/g, "$1")}
              </p>
            );
          })}
        </div>
      </div>

      <button
        onClick={fetchExplanation}
        className="self-start text-xs text-[#71717A] underline hover:text-[#A1A1AA]"
      >
        Regenerate
      </button>
    </div>
  );
}
