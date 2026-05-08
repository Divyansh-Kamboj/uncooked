"use client";

import Image from "next/image";
import { parseImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { useState } from "react";
import type { Question } from "@/lib/api/questions";

interface QuestionViewerProps {
  question: Question;
}

export function QuestionViewer({ question }: QuestionViewerProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imgUrl = parseImageUrl(question.question_img);

  return (
    <div className="flex flex-col gap-4">
      {/* Metadata pills */}
      <div className="flex flex-wrap gap-2">
        {question.paper_year && (
          <span className="rounded-full border border-[#222222] bg-[#1A1A1A] px-2.5 py-0.5 text-xs text-[#A1A1AA]">
            {question.paper_year}
          </span>
        )}
        {question.session && (
          <span className="rounded-full border border-[#222222] bg-[#1A1A1A] px-2.5 py-0.5 text-xs text-[#A1A1AA]">
            {question.session}
          </span>
        )}
        {question.topic && (
          <span className="rounded-full border border-[#222222] bg-[#1A1A1A] px-2.5 py-0.5 text-xs text-[#A1A1AA]">
            {question.topic}
          </span>
        )}
        {question.difficulty && (
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              question.difficulty === "Easy"
                ? "border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]"
                : question.difficulty === "Medium"
                ? "border-[#EAB308]/30 bg-[#EAB308]/10 text-[#EAB308]"
                : "border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]"
            }`}
          >
            {question.difficulty}
          </span>
        )}
      </div>

      {/* Question image */}
      <div className="relative rounded-xl border border-[#222222] bg-white overflow-hidden">
        {imgUrl && !imgError ? (
          <>
            {!imgLoaded && (
              <Skeleton className="absolute inset-0 rounded-xl" />
            )}
            {/* Using regular img tag for external URLs without configured domains */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={`Question ${question.question_number ?? question.id}`}
              className={`w-full h-auto transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center p-8">
            <p className="text-center text-sm text-[#71717A]">
              {imgError ? "Failed to load question image." : "Question image not available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
