import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export const Section = ({ id, eyebrow, title, children, className, containerClassName }: SectionProps) => (
  <section id={id} className={cn("py-24 md:py-32 px-6", className)}>
    <div className={cn("max-w-5xl mx-auto", containerClassName)}>
      {(eyebrow || title) && (
        <div className="text-center mb-16 md:mb-20">
          {eyebrow && (
            <p className="text-xs tracking-[0.4em] uppercase text-primary/70 mb-4">{eyebrow}</p>
          )}
          {title && (
            <h2 className="font-display text-4xl md:text-6xl text-foreground text-balance">
              {title}
            </h2>
          )}
          <div className="divider-ornament mt-8">
            <span className="text-lg">✦</span>
          </div>
        </div>
      )}
      {children}
    </div>
  </section>
);
