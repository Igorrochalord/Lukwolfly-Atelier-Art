"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/cn";
import { BOARD_COLUMN_LABEL, BOARD_COLUMNS, type BoardCard, type BoardColumn } from "@/lib/schema";

export const COLUMN_ACCENT: Record<BoardColumn, string> = {
  fila: "bg-mute",
  rascunho: "bg-lilac",
  lineart: "bg-sky",
  cor: "bg-rose",
  finalizado: "bg-lime",
};

/** Quadro público (somente leitura) da fila de desenhos, estilo Trello. */
export function Board({ cards }: { cards: BoardCard[] }) {
  return (
    <div className="no-scrollbar -mx-[var(--gutter)] snap-x snap-mandatory overflow-x-auto px-[var(--gutter)] pb-4">
      <div className="grid auto-cols-[minmax(15rem,1fr)] grid-flow-col gap-4">
        {BOARD_COLUMNS.map((col, ci) => {
          const list = cards.filter((c) => c.column === col);
          return (
            <motion.section
              key={col}
              aria-label={BOARD_COLUMN_LABEL[col]}
              className="snap-start rounded-[1.25rem] bg-ink-2 p-3 shadow-[inset_0_0_0_1px_var(--color-line)]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: ci * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <header className="mb-3 flex items-center justify-between px-2 pt-1">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <span className={cn("size-2.5 rounded-full", COLUMN_ACCENT[col])} />
                  {BOARD_COLUMN_LABEL[col]}
                </h3>
                <span className="font-mono text-xs text-mute">{String(list.length).padStart(2, "0")}</span>
              </header>
              <ul className="space-y-2.5">
                {list.map((c, i) => (
                  <motion.li
                    key={c.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + ci * 0.07 + i * 0.05 }}
                    className="rounded-xl bg-ink-3 p-3.5 transition-transform duration-300 hover:-translate-y-0.5 hover:-rotate-[0.6deg]"
                  >
                    <span className={cn("mb-2.5 block h-1 w-8 rounded-full", COLUMN_ACCENT[col])} />
                    <p className="font-medium leading-snug">{c.title}</p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-mute">
                      <span className="truncate">{c.client}</span>
                      {c.kind && <span className="font-mono uppercase">{c.kind}</span>}
                    </div>
                    {c.note && <p className="mt-2 border-t border-dashed border-line-2 pt-2 text-xs text-mute">{c.note}</p>}
                  </motion.li>
                ))}
                {!list.length && <li className="rounded-xl border-[1.5px] border-dashed border-line px-3 py-6 text-center text-xs text-mute">vazio</li>}
              </ul>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
