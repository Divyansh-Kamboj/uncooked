interface EmptyStateProps {
  onClearFilters: () => void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-[#222222] bg-[#111111] px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#222222] bg-[#1A1A1A]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-[#FAFAFA]">No questions found</p>
        <p className="mt-1 text-sm text-[#71717A]">
          Try adjusting your filters to find matching questions.
        </p>
      </div>
      <button
        onClick={onClearFilters}
        className="rounded-lg border border-[#222222] bg-[#1A1A1A] px-4 py-2 text-xs font-medium text-[#A1A1AA] transition-colors hover:bg-[#222222] hover:text-[#FAFAFA]"
      >
        Clear filters
      </button>
    </div>
  );
}
