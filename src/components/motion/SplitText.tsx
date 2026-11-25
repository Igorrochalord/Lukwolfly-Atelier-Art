"use client";

import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

type Props = {
  text: string;
  className?: string;
  /** Classe aplicada a cada linha (wrapper com overflow hidden). */
  lineClassName?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  stagger?: number;
  /** "inView" anima ao rolar; "mount" anima ao montar. */
  trigger?: "inView" | "mount";
  /** Quebra manual de linhas com "\n". */
  by?: "word" | "line";
};

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Tipografia animada: cada palavra/linha sobe de dentro de uma máscara.
 * Leitores de tela recebem o texto inteiro via aria-label.
 */
export function SplitText({
  text,
  className,
  lineClassName,
  as = "span",
  delay = 0,
  stagger = 0.06,
  trigger = "inView",
  by = "word",
}: Props) {
  const reduce = useReducedMotionSafe();
  const Tag = as;
  const lines = text.split("\n");

  if (reduce) {
    return (
      <Tag className={className}>
        {lines.map((l, i) => (
          <span key={i} className={`block ${lineClassName ?? ""}`}>
            {l}
          </span>
        ))}
      </Tag>
    );
  }

  const animate = trigger === "mount" ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.4 } };
  let n = 0;

  return (
    <Tag className={className} aria-label={text.replace(/\n/g, " ")}>
      <motion.span className="block" initial="hidden" {...animate} aria-hidden>
        {lines.map((line, li) => (
          <span key={li} className={`-my-[0.14em] block overflow-hidden py-[0.14em] ${lineClassName ?? ""}`}>
            {(by === "word" ? line.split(" ") : [line]).map((w, wi, arr) => {
              const i = n++;
              return (
                <motion.span
                  key={wi}
                  className="inline-block will-change-transform"
                  variants={{ hidden: { y: "110%", rotate: 4 }, show: { y: "0%", rotate: 0 } }}
                  transition={{ duration: 0.9, ease: EASE, delay: delay + i * stagger }}
                >
                  {w}
                  {by === "word" && wi < arr.length - 1 ? " " : ""}
                </motion.span>
              );
            })}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
