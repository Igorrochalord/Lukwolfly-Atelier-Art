"use client";

import { motion, useInView, type Variants } from "motion/react";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { useRef } from "react";

type Mode = "up" | "mask" | "fade" | "wipe";

const EASE = [0.16, 1, 0.3, 1] as const;

const variants: Record<Mode, Variants> = {
  up: { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  mask: {
    hidden: { clipPath: "inset(100% 0% 0% 0%)", y: 30 },
    // libera o clip ao final para não cortar elementos que vazam do bloco
    show: { clipPath: "inset(0% 0% 0% 0%)", y: 0, transitionEnd: { clipPath: "none" } },
  },
  wipe: {
    hidden: { clipPath: "inset(0% 100% 0% 0%)" },
    show: { clipPath: "inset(0% 0% 0% 0%)", transitionEnd: { clipPath: "none" } },
  },
};

type Props = {
  children: React.ReactNode;
  mode?: Mode;
  delay?: number;
  duration?: number;
  className?: string;
  /** Classe do elemento animado interno (só nos modos com máscara). */
  innerClassName?: string;
  as?: "div" | "section" | "li" | "article" | "figure" | "header" | "p";
  amount?: number;
};

/**
 * Revela o conteúdo ao entrar na viewport.
 * O elemento observado nunca recebe clip-path (o IntersectionObserver
 * considera o recorte e nunca dispararia); a máscara vai num filho interno.
 */
export function Reveal({
  children,
  mode = "up",
  delay = 0,
  duration = 1,
  className,
  innerClassName = "h-full",
  as = "div",
  amount = 0.2,
}: Props) {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const state = inView ? "show" : "hidden";
  const transition = { duration, delay, ease: EASE };

  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  if (mode === "mask" || mode === "wipe") {
    const Outer = as;
    return (
      <Outer ref={ref as never} className={className}>
        <motion.div className={innerClassName} initial="hidden" animate={state} variants={variants[mode]} transition={transition}>
          {children}
        </motion.div>
      </Outer>
    );
  }

  const Tag = motion[as];
  return (
    <Tag ref={ref as never} className={className} initial="hidden" animate={state} variants={variants[mode]} transition={transition}>
      {children}
    </Tag>
  );
}
