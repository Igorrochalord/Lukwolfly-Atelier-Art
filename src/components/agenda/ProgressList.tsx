"use client";

import { animate, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { PROGRESS_KIND_LABEL, STAGES, type ProgressItem } from "@/lib/schema";

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{v}</span>;
}

/**
 * Linha do tempo de produção: cada encomenda vira uma "fita" com as 6 etapas.
 * Etapas concluídas ficam cheias, a atual pulsa, as próximas ficam tracejadas.
 */
export function ProgressList({ items }: { items: ProgressItem[] }) {
  if (!items.length) {
    return <p className="rounded-2xl border-[1.5px] border-dashed border-line-2 p-8 text-mute">Nenhuma encomenda em produção agora — bancada livre!</p>;
  }
  return (
    <ol className="space-y-4">
      {items.map((p, idx) => {
        const done = p.stage >= STAGES.length;
        const pct = Math.round((Math.min(p.stage, STAGES.length) / STAGES.length) * 100);
        return (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.06 }}
            className={cn("group rounded-[1.5rem] p-5 md:p-7", done ? "bg-ink-2/50" : "bg-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)]")}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tag">{PROGRESS_KIND_LABEL[p.kind]}</span>
                  {p.eta && !done && <span className="chip text-mute shadow-[inset_0_0_0_1px_var(--color-line-2)]">Previsão · {p.eta}</span>}
                  {done && <span className="chip bg-sky text-ink">Entregue</span>}
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{p.title}</p>
                <p className="text-mute">
                  para <span className="serif-i text-lg text-text">{p.client || "cliente"}</span>
                  {p.note && <span> · {p.note}</span>}
                </p>
              </div>
              <p className="display text-6xl text-lime tabular-nums md:text-7xl" aria-label={`${pct}% concluído`}>
                <Counter to={pct} />
                <span className="text-3xl">%</span>
              </p>
            </div>

            <div className="mt-6 grid grid-cols-6 gap-1.5" role="list" aria-label="Etapas">
              {STAGES.map((s, i) => {
                const state = i < p.stage ? "done" : i === p.stage ? "now" : "next";
                return (
                  <div key={s} role="listitem" aria-current={state === "now" ? "step" : undefined} className="min-w-0">
                    <div className="relative h-2 overflow-hidden rounded-full bg-ink-3">
                      {state === "next" && <span className="stitch absolute inset-x-1 top-1/2 -translate-y-1/2 text-line-2" />}
                      <motion.span
                        className={cn("absolute inset-0 origin-left rounded-full", state === "done" ? "bg-lime" : "bg-lime/40")}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: state === "next" ? 0 : state === "now" ? 0.5 : 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.25 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                      />
                      {state === "now" && <span className="absolute top-0 left-1/2 size-2 -translate-x-1/2 animate-pulse-dot rounded-full bg-lime text-lime" />}
                    </div>
                    <p className={cn("label mt-2 truncate !text-[0.62rem]", state === "next" ? "text-mute/60" : state === "now" ? "text-lime" : "text-text")}>{s}</p>
                  </div>
                );
              })}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
