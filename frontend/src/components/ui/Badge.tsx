import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error";
}

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  const variants = {
    default: "border-[#222222] bg-[#1A1A1A] text-[#A1A1AA]",
    primary: "border-[#F97316]/30 bg-[#F97316]/10 text-[#F97316]",
    success: "border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]",
    warning: "border-[#EAB308]/30 bg-[#EAB308]/10 text-[#EAB308]",
    error: "border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
