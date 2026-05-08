import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-8 px-6 text-center">
      {/* Logo / Brand */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F97316]">
          <span className="text-xl font-bold text-black">U</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-[#FAFAFA] sm:text-6xl">
          Uncooked
        </h1>
      </div>

      {/* Tagline */}
      <p className="max-w-lg text-lg text-[#A1A1AA] leading-relaxed">
        Focused CAIE A-Level Mathematics practice. Work through past-paper questions by component, with instant mark scheme support and AI explanations.
      </p>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/start"
          className="inline-flex items-center justify-center rounded-lg bg-[#F97316] px-8 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-[#EA6C0A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
        >
          Start practice
        </Link>
        <p className="text-xs text-[#71717A]">1,943 questions across 5 components</p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#A1A1AA]">
        {["Pure 1", "Pure 3", "Mechanics", "Stats 1", "Stats 2"].map((c) => (
          <span
            key={c}
            className="rounded-full border border-[#222222] bg-[#111111] px-3 py-1"
          >
            {c}
          </span>
        ))}
      </div>
    </main>
  );
}
