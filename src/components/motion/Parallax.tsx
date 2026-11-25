"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { useRef } from "react";

type Props = {
  children: React.ReactNode;
  /** Deslocamento total em px (positivo = desce mais devagar). */
  offset?: number;
  className?: string;
  innerClassName?: string;
};

/** Parallax discreto baseado na posição do elemento na viewport. */
export function Parallax({ children, offset = 80, className, innerClassName }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-offset / 2, offset / 2]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }} className={innerClassName ?? "h-full w-full"}>
        {children}
      </motion.div>
    </div>
  );
}
