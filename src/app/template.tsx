"use client";

import { motion } from "motion/react";
import { useEffect } from "react";

import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

let hasNavigated = false;

/**
 * Transição entre páginas: uma "fita" de tecido lima atravessa a tela
 * com uma costura tracejada e revela a página nova.
 * O 1º carregamento não anima (conteúdo visível sem JS).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotionSafe();
  const animateIn = hasNavigated && !reduce;
  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <>
      {animateIn && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[70] origin-right bg-lime"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
        >
          <span className="stitch absolute inset-x-0 top-1/2 text-ink/60" />
        </motion.div>
      )}
      <motion.div
        initial={animateIn ? { opacity: 0, y: 30 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
      >
        {children}
      </motion.div>
    </>
  );
}
