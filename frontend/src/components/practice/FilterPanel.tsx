"use client";

import { useState, useEffect } from "react";
import { getTopics, getYears, getQuestionCount } from "@/lib/api/questions";
import { Skeleton } from "@/components/ui/Skeleton";

const SESSIONS = ["Feb/March", "May/June", "Oct/Nov"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

interface Filters {
  topic?: string;
  difficulty?: string;
  year?: string;
  session?: string;
}

interface FilterPanelProps {
  component: string;
  filters: Filters;
  onChange: (filters: Filters) => void;
  questionCount: number;
  countLoading: boolean;
}

export function FilterPanel({
  component,
  filters,
  onChange,
  questionCount,
  countLoading,
}: FilterPanelProps) {
  const [topics, setTopics] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [t, y] = await Promise.all([getTopics(component), getYears(component)]);
      setTopics(t);
      setYears(y);
      setLoading(false);
    }
    load();
  }, [component]);

  const set = (key: keyof Filters, value: string | undefined) => {
    onChange({ ...filters, [key]: value });
  };

  const clearAll = () => onChange({});
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="rounded-xl border border-[#222222] bg-[#111111] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#FAFAFA]">Filters</h2>
        <div className="flex items-center gap-3">
          {/* Live count */}
          <span className="text-xs text-[#71717A]">
            {countLoading ? (
              <Skeleton className="h-3 w-16 inline-block" />
            ) : (
              <span>
                <span className="font-semibold text-[#F97316]">{questionCount}</span> questions
              </span>
            )}
          </span>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-[#71717A] underline hover:text-[#FAFAFA]"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Topic */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#71717A]">Topic</label>
          {loading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <select
              value={filters.topic ?? ""}
              onChange={(e) => set("topic", e.target.value || undefined)}
              className="w-full rounded-lg border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-xs text-[#FAFAFA] focus:border-[#F97316] focus:outline-none"
            >
              <option value="">All topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Year */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#71717A]">Year</label>
          {loading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <select
              value={filters.year ?? ""}
              onChange={(e) => set("year", e.target.value || undefined)}
              className="w-full rounded-lg border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-xs text-[#FAFAFA] focus:border-[#F97316] focus:outline-none"
            >
              <option value="">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Session */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#71717A]">Session</label>
          <select
            value={filters.session ?? ""}
            onChange={(e) => set("session", e.target.value || undefined)}
            className="w-full rounded-lg border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-xs text-[#FAFAFA] focus:border-[#F97316] focus:outline-none"
          >
            <option value="">All sessions</option>
            {SESSIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#71717A]">Difficulty</label>
          <div className="flex gap-1.5">
            {DIFFICULTIES.map((d) => {
              const active = filters.difficulty === d;
              const colors: Record<string, string> = {
                Easy: active
                  ? "border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]"
                  : "border-[#222222] text-[#71717A] hover:border-[#22C55E]/50",
                Medium: active
                  ? "border-[#EAB308] bg-[#EAB308]/10 text-[#EAB308]"
                  : "border-[#222222] text-[#71717A] hover:border-[#EAB308]/50",
                Hard: active
                  ? "border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]"
                  : "border-[#222222] text-[#71717A] hover:border-[#EF4444]/50",
              };
              return (
                <button
                  key={d}
                  onClick={() => set("difficulty", active ? undefined : d)}
                  className={`flex-1 rounded-md border px-1.5 py-1.5 text-xs font-medium transition-colors ${colors[d]}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
