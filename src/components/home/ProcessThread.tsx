"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";

type Step = { t: string; d: string };

/** Etapas ligadas por uma linha que se "costura" conforme a rolagem. */
export function ProcessThread({ steps }: { steps: readonly Step[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const len = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  return (
    <ol ref={ref} className="relative grid gap-10 pl-12 md:grid-cols-4 md:gap-6 md:pt-14 md:pl-0">
      <svg aria-hidden className="absolute top-0 left-4 h-full w-2 md:top-5 md:left-0 md:h-2 md:w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <line x1="0" y1="50" x2="100" y2="50" className="hidden stroke-line-2 md:block" strokeWidth="2" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        <motion.line x1="0" y1="50" x2="100" y2="50" className="hidden stroke-lime md:block" strokeWidth="3" vectorEffect="non-scaling-stroke" style={{ pathLength: len }} />
        <line x1="50" y1="0" x2="50" y2="100" className="stroke-line-2 md:hidden" strokeWidth="2" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        <motion.line x1="50" y1="0" x2="50" y2="100" className="stroke-lime md:hidden" strokeWidth="3" vectorEffect="non-scaling-stroke" style={{ pathLength: len }} />
      </svg>
      {steps.map((s, i) => (
        <motion.li
          key={s.t}
          className="relative"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="absolute top-0 -left-12 grid size-9 place-items-center rounded-full bg-paper font-mono text-sm font-semibold text-paper-ink md:static md:mb-5 md:-mt-[3.4rem]">
            {i + 1}
          </span>
          <p className="text-xl font-semibold tracking-tight">{s.t}</p>
          <p className="mt-2 text-mute">{s.d}</p>
        </motion.li>
      ))}
    </ol>
  );
}
