import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-xl border border-[#222222] bg-[#111111] ${hover ? "cursor-pointer transition-colors hover:border-[#F97316]/50 hover:bg-[#1A1A1A]" : ""} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
