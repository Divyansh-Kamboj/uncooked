"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { FilterPanel } from "@/components/practice/FilterPanel";
import { QuestionViewer } from "@/components/practice/QuestionViewer";
import { AnswerPanel } from "@/components/practice/AnswerPanel";
import { ExplainPanel } from "@/components/practice/ExplainPanel";
import { NavControls } from "@/components/practice/NavControls";
import { EmptyState } from "@/components/practice/EmptyState";
import { SessionSummary } from "@/components/session/SessionSummary";
import { Skeleton } from "@/components/ui/Skeleton";
import { getQuestions, getQuestionCount, type Question } from "@/lib/api/questions";
import { useSessionStore } from "@/store/sessionStore";
import { slugToComponent, shuffle } from "@/lib/utils";

type Tab = "question" | "answer" | "explain";

interface Filters {
  topic?: string;
  difficulty?: string;
  year?: string;
  session?: string;
}

interface PageProps {
  params: Promise<{ component: string }>;
}

export default function ComponentPracticePage({ params }: PageProps) {
  const { component: componentSlug } = use(params);
  const component = slugToComponent(componentSlug);
  const router = useRouter();

  // Session store
  const {
    questions,
    currentIndex,
    viewedIds,
    setQuestions,
    goNext,
    goPrev,
    resetSession,
    markViewed,
  } = useSessionStore();

  // Local UI state
  const [filters, setFilters] = useState<Filters>({});
  const [tab, setTab] = useState<Tab>("question");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [countLoading, setCountLoading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const currentQuestion: Question | undefined = questions[currentIndex];

  // Load count whenever filters change (before starting)
  useEffect(() => {
    if (started) return; // Don't refetch count during active session
    let cancelled = false;
    setCountLoading(true);
    getQuestionCount({ component, ...filters })
      .then((n) => { if (!cancelled) setQuestionCount(n); })
      .catch(() => { if (!cancelled) setQuestionCount(0); })
      .finally(() => { if (!cancelled) setCountLoading(false); });
    return () => { cancelled = true; };
  }, [component, filters, started]);

  // Start session: load and shuffle questions
  const startSession = useCallback(async () => {
    setLoading(true);
    try {
      const qs = await getQuestions({ component, ...filters });
      const shuffled = shuffle(qs);
      setQuestions(shuffled);
      setQuestionCount(shuffled.length);
      setStarted(true);
      setTab("question");
      // Mark first question as viewed
      if (shuffled[0]) markViewed(shuffled[0].id);
    } catch {
      // Could show toast here
    } finally {
      setLoading(false);
    }
  }, [component, filters, setQuestions, markViewed]);

  // Handle filter changes — reset session
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setStarted(false);
    resetSession();
  };

  // Update explanation in store (cache in local state)
  const handleExplanationFetched = useCallback(
    (id: number, explanation: string) => {
      // Update the question in the store's questions array
      useSessionStore.setState((state) => ({
        questions: state.questions.map((q) =>
          q.id === id ? { ...q, ai_explanation: explanation } : q
        ),
      }));
    },
    []
  );

  // Handle nav with tab reset to question on navigation
  const handleNext = useCallback(() => {
    goNext();
    setTab("question");
    if (questions[currentIndex + 1]) markViewed(questions[currentIndex + 1].id);
  }, [goNext, questions, currentIndex, markViewed]);

  const handlePrev = useCallback(() => {
    goPrev();
    setTab("question");
  }, [goPrev]);

  const handleRevealAnswer = useCallback(() => {
    setTab("answer");
  }, []);

  const handleEndSession = () => setSummaryOpen(true);

  const handleStartOver = () => {
    resetSession();
    setStarted(false);
    setFilters({});
  };

  return (
    <>
      <Navbar
        showEndSession={started && questions.length > 0}
        onEndSession={handleEndSession}
      />

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-[#71717A]">
          <button
            onClick={() => router.push("/practice")}
            className="hover:text-[#FAFAFA] transition-colors"
          >
            Practice
          </button>
          <span>/</span>
          <span className="text-[#A1A1AA]">{component}</span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#FAFAFA]">{component}</h1>
          {!started && (
            <p className="mt-1 text-sm text-[#71717A]">
              Set your filters, then start practising.
            </p>
          )}
        </div>

        {/* Filter panel — show before session starts */}
        {!started && (
          <>
            <div className="mb-6">
              <FilterPanel
                component={component}
                filters={filters}
                onChange={handleFilterChange}
                questionCount={questionCount}
                countLoading={countLoading}
              />
            </div>

            {/* Start button */}
            <div className="flex items-center justify-center gap-4">
              {questionCount === 0 && !countLoading ? (
                <EmptyState onClearFilters={() => handleFilterChange({})} />
              ) : (
                <button
                  onClick={startSession}
                  disabled={loading || questionCount === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-8 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-[#EA6C0A] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      Loading…
                    </>
                  ) : (
                    <>
                      Start practising
                      {!countLoading && questionCount > 0 && (
                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">
                          {questionCount}
                        </span>
                      )}
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}

        {/* Active session */}
        {started && questions.length > 0 && currentQuestion && (
          <div className="flex flex-col gap-6">
            {/* Tabs */}
            <div className="flex rounded-xl border border-[#222222] bg-[#0A0A0A] p-1 gap-1">
              {(["question", "answer", "explain"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors capitalize ${
                    tab === t
                      ? "bg-[#1A1A1A] text-[#FAFAFA] shadow-sm"
                      : "text-[#71717A] hover:text-[#A1A1AA]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div>
              {tab === "question" && <QuestionViewer question={currentQuestion} />}
              {tab === "answer" && <AnswerPanel question={currentQuestion} />}
              {tab === "explain" && (
                <ExplainPanel
                  question={currentQuestion}
                  onExplanationFetched={handleExplanationFetched}
                />
              )}
            </div>

            {/* Navigation */}
            <NavControls
              currentIndex={currentIndex}
              total={questions.length}
              onPrev={handlePrev}
              onNext={handleNext}
              onRevealAnswer={handleRevealAnswer}
            />

            {/* Viewed indicator */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#71717A]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
              <span>{viewedIds.size} question{viewedIds.size !== 1 ? "s" : ""} viewed this session</span>
            </div>
          </div>
        )}
      </main>

      {/* Session summary modal */}
      <SessionSummary
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        viewedCount={viewedIds.size}
        totalCount={questions.length}
        onStartOver={handleStartOver}
      />
    </>
  );
}
