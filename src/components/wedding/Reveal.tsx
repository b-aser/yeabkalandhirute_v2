import { ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const Reveal = ({ children, delay = 0, className }: RevealProps) => {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-1000 ease-out will-change-transform",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
