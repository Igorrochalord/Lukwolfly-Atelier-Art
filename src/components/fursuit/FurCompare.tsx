"use client";

import { motion } from "motion/react";
import { useState } from "react";

import { cn } from "@/lib/cn";

type Row = { k: string; nacional: string; internacional: string };
type Side = "nacional" | "internacional";

/** Amostra de "pelo" desenhada em CSS — fios que balançam no hover. */
function Swatch({ side, active }: { side: Side; active: boolean }) {
  const long = side === "internacional";
  return (
    <div aria-hidden className="relative h-28 overflow-hidden rounded-xl">
      <div
        className={cn("absolute inset-0 transition-transform duration-[1.2s] ease-out-luk", active && "skew-x-6")}
        style={{
          background: long
            ? "repeating-linear-gradient(100deg, #b79cff 0 3px, #9a7df0 3px 5px, #cdb9ff 5px 7px)"
            : "repeating-linear-gradient(95deg, #72d4f3 0 2px, #5cc1e0 2px 3px, #8fe0f8 3px 4px)",
          filter: long ? "blur(.3px)" : "none",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent mix-blend-overlay" />
    </div>
  );
}

export function FurCompare({ rows, note }: { rows: Row[]; note: string }) {
  const [focus, setFocus] = useState<Side | null>(null);
  const sides: { id: Side; title: string; sub: string; color: string }[] = [
    { id: "nacional", title: "Nacional", sub: "acessível e rápido", color: "text-sky" },
    { id: "internacional", title: "Internacional", sub: "luxo e movimento", color: "text-lilac" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:gap-5" role="group" aria-label="Destacar um tipo de pelo">
        {sides.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={focus === s.id}
            onClick={() => setFocus((f) => (f === s.id ? null : s.id))}
            onPointerEnter={() => setFocus(s.id)}
            onPointerLeave={() => setFocus(null)}
            className={cn(
              "rounded-[1.25rem] bg-ink-2 p-3 text-left transition-[box-shadow,opacity] duration-500 md:p-4",
              focus === s.id ? "shadow-[inset_0_0_0_2px_currentColor]" : "shadow-[inset_0_0_0_1px_var(--color-line)]",
              focus && focus !== s.id && "opacity-50",
              s.color,
            )}
          >
            <Swatch side={s.id} active={focus === s.id} />
            <p className="display mt-4 text-3xl text-text md:text-5xl">{s.title}</p>
            <p className="serif-i text-lg">{s.sub}</p>
          </button>
        ))}
      </div>

      <dl className="mt-6 divide-y divide-dashed divide-line-2 border-y border-dashed border-line-2">
        {rows.map((r, i) => (
          <motion.div
            key={r.k}
            className="grid grid-cols-2 gap-3 py-4 md:grid-cols-[10rem_1fr_1fr] md:gap-5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <dt className="label col-span-2 text-lime md:col-span-1 md:pt-1">{r.k}</dt>
            <dd className={cn("text-sm transition-opacity duration-300 md:text-base", focus === "internacional" && "opacity-30")}>{r.nacional}</dd>
            <dd className={cn("text-sm transition-opacity duration-300 md:text-base", focus === "nacional" && "opacity-30")}>{r.internacional}</dd>
          </motion.div>
        ))}
      </dl>
      <p className="mt-5 text-mute">{note}</p>
    </div>
  );
}
