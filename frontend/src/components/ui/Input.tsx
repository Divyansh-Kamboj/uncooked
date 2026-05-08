"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#A1A1AA]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border border-[#222222] bg-[#111111] px-3 py-2.5 text-sm text-[#FAFAFA] placeholder-[#71717A] transition-colors focus:border-[#F97316] focus:outline-none ${error ? "border-[#EF4444]" : ""} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
