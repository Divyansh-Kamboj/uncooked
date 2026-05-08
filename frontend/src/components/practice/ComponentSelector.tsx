"use client";

import { useRouter } from "next/navigation";
import { componentToSlug } from "@/lib/utils";

const COMPONENTS = [
  {
    name: "Pure 1",
    description: "Functions, coordinate geometry, trigonometry, differentiation, integration",
    icon: "P1",
    color: "from-orange-500/20 to-orange-500/5",
  },
  {
    name: "Pure 3",
    description: "Complex analysis, further calculus, differential equations, vectors",
    icon: "P3",
    color: "from-amber-500/20 to-amber-500/5",
  },
  {
    name: "Mechanics",
    description: "Forces, kinematics, Newton's laws, energy, momentum",
    icon: "M",
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    name: "Stats 1",
    description: "Probability, distributions, hypothesis testing, correlation",
    icon: "S1",
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    name: "Stats 2",
    description: "Further probability, inference, Poisson distribution, chi-squared",
    icon: "S2",
    color: "from-pink-500/20 to-pink-500/5",
  },
];

export function ComponentSelector() {
  const router = useRouter();

  const handleSelect = (component: string) => {
    router.push(`/practice/${componentToSlug(component)}`);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {COMPONENTS.map((comp) => (
        <button
          key={comp.name}
          onClick={() => handleSelect(comp.name)}
          className="group relative flex flex-col gap-3 rounded-xl border border-[#222222] bg-[#111111] p-5 text-left transition-all hover:border-[#F97316]/40 hover:bg-[#1A1A1A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
        >
          {/* Icon */}
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${comp.color} border border-white/10`}
          >
            <span className="text-xs font-bold text-[#FAFAFA]">{comp.icon}</span>
          </div>

          {/* Name */}
          <div>
            <h3 className="font-semibold text-[#FAFAFA] group-hover:text-[#F97316] transition-colors">
              {comp.name}
            </h3>
            <p className="mt-1 text-xs text-[#71717A] leading-relaxed">{comp.description}</p>
          </div>

          {/* Arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444444] transition-colors group-hover:text-[#F97316]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
}
