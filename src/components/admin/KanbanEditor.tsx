"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";

import { addCard, deleteCard, moveCard, updateCard } from "@/app/admin/actions";
import { COLUMN_ACCENT } from "@/components/agenda/Board";
import { artPrices } from "@/content/site";
import { cn } from "@/lib/cn";
import { BOARD_COLUMN_LABEL, BOARD_COLUMNS, type BoardCard, type BoardColumn } from "@/lib/schema";

type Draft = { title: string; client: string; kind: string; note: string };
const EMPTY: Draft = { title: "", client: "", kind: artPrices[0].name, note: "" };

function CardForm({ initial, onSave, onCancel, submitLabel }: { initial: Draft; onSave: (d: Draft) => void; onCancel: () => void; submitLabel: string }) {
  const [d, setD] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (d.title.trim()) onSave(d);
      }}
      className="space-y-2 rounded-xl bg-ink p-3 shadow-[inset_0_0_0_1px_var(--color-lime)]"
    >
      <input autoFocus className="admin-input" placeholder="Título (ex.: Headshot — raposa)" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <input className="admin-input" placeholder="Cliente (apelido)" value={d.client} onChange={(e) => setD({ ...d, client: e.target.value })} />
        <input className="admin-input" placeholder="Tipo" list="art-kinds" value={d.kind} onChange={(e) => setD({ ...d, kind: e.target.value })} />
      </div>
      <input className="admin-input" placeholder="Nota (opcional, pública)" value={d.note} onChange={(e) => setD({ ...d, note: e.target.value })} />
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="rounded-full px-3 py-1.5 text-sm text-mute">
          Cancelar
        </button>
        <button className="rounded-full bg-lime px-4 py-1.5 text-sm font-semibold text-ink">{submitLabel}</button>
      </div>
    </form>
  );
}

/**
 * Quadro editável: arraste cards entre colunas (desktop) ou use as setas (touch).
 * Atualização otimista + server action; o servidor renumera as posições.
 */
export function KanbanEditor({ cards: initial }: { cards: BoardCard[] }) {
  const [cards, setCards] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<{ col: BoardColumn; index: number } | null>(null);
  const [adding, setAdding] = useState<BoardColumn | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [, start] = useTransition();

  // dados novos do servidor substituem o estado otimista
  const [source, setSource] = useState(initial);
  if (initial !== source) {
    setSource(initial);
    setCards(initial);
  }

  const colCards = (col: BoardColumn) => cards.filter((c) => c.column === col).sort((a, b) => a.position - b.position);

  function applyMove(id: string, col: BoardColumn, index: number) {
    setCards((prev) => {
      const card = prev.find((c) => c.id === id);
      if (!card) return prev;
      const rest = prev.filter((c) => c.id !== id);
      const target = rest.filter((c) => c.column === col).sort((a, b) => a.position - b.position);
      target.splice(Math.min(index, target.length), 0, { ...card, column: col });
      const renum = new Map(target.map((c, i) => [c.id, i]));
      return [...rest.filter((c) => c.column !== col), ...target].map((c) => (renum.has(c.id) ? { ...c, position: renum.get(c.id)! } : c));
    });
    start(() => moveCard(id, col, index));
  }

  function shift(card: BoardCard, d: -1 | 1) {
    const i = BOARD_COLUMNS.indexOf(card.column) + d;
    if (i < 0 || i >= BOARD_COLUMNS.length) return;
    applyMove(card.id, BOARD_COLUMNS[i], colCards(BOARD_COLUMNS[i]).length);
  }

  return (
    <>
      <datalist id="art-kinds">
        {artPrices.map((a) => (
          <option key={a.id} value={a.name} />
        ))}
      </datalist>
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4 pb-6">
        <div className="grid auto-cols-[minmax(16rem,1fr)] grid-flow-col gap-4">
          {BOARD_COLUMNS.map((col) => {
            const list = colCards(col);
            const isOver = over?.col === col;
            return (
              <section
                key={col}
                aria-label={BOARD_COLUMN_LABEL[col]}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isOver) setOver({ col, index: list.length });
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId && over) applyMove(dragId, over.col, over.index);
                  setDragId(null);
                  setOver(null);
                }}
                className={cn(
                  "flex min-h-[60vh] flex-col rounded-2xl bg-ink-2 p-3 transition-shadow",
                  isOver ? "shadow-[inset_0_0_0_2px_var(--color-lime)]" : "shadow-[inset_0_0_0_1px_var(--color-line)]",
                )}
              >
                <header className="mb-3 flex items-center justify-between px-1">
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <span className={cn("size-2.5 rounded-full", COLUMN_ACCENT[col])} />
                    {BOARD_COLUMN_LABEL[col]}
                    <span className="font-mono text-xs text-mute">{list.length}</span>
                  </h2>
                  <button type="button" onClick={() => setAdding(col)} className="grid size-7 place-items-center rounded-full text-lg text-mute hover:bg-ink-3 hover:text-text" aria-label={`Adicionar card em ${BOARD_COLUMN_LABEL[col]}`}>
                    +
                  </button>
                </header>

                {adding === col && (
                  <div className="mb-2.5">
                    <CardForm
                      initial={EMPTY}
                      submitLabel="Adicionar"
                      onCancel={() => setAdding(null)}
                      onSave={(d) => {
                        setAdding(null);
                        start(() => addCard({ ...d, column: col }).then(() => {}));
                      }}
                    />
                  </div>
                )}

                <ul className="flex-1 space-y-2.5">
                  <AnimatePresence initial={false}>
                    {list.map((c, i) => (
                      <motion.li
                        key={c.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: dragId === c.id ? 0.4 : 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                      >
                        {isOver && over.index === i && dragId !== c.id && <div className="mb-2.5 h-1 rounded-full bg-lime" />}
                        {editing === c.id ? (
                          <CardForm
                            initial={c}
                            submitLabel="Salvar"
                            onCancel={() => setEditing(null)}
                            onSave={(d) => {
                              setEditing(null);
                              setCards((p) => p.map((x) => (x.id === c.id ? { ...x, ...d } : x)));
                              start(() => updateCard(c.id, d));
                            }}
                          />
                        ) : (
                          <div
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData("text/plain", c.id);
                              setDragId(c.id);
                            }}
                            onDragEnd={() => {
                              setDragId(null);
                              setOver(null);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const r = e.currentTarget.getBoundingClientRect();
                              const index = e.clientY < r.top + r.height / 2 ? i : i + 1;
                              if (over?.col !== col || over.index !== index) setOver({ col, index });
                            }}
                            className="group cursor-grab rounded-xl bg-ink-3 p-3 active:cursor-grabbing"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium leading-snug">{c.title}</p>
                              <div className="flex shrink-0 gap-0.5 opacity-60 group-hover:opacity-100">
                                <button type="button" onClick={() => setEditing(c.id)} className="rounded px-1.5 text-xs text-mute hover:text-text" aria-label="Editar">
                                  ✎
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!confirm(`Apagar "${c.title}"?`)) return;
                                    setCards((p) => p.filter((x) => x.id !== c.id));
                                    start(() => deleteCard(c.id));
                                  }}
                                  className="rounded px-1.5 text-xs text-mute hover:text-rose"
                                  aria-label="Apagar"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                            <p className="mt-1 text-xs text-mute">
                              {c.client} {c.kind && <span className="font-mono uppercase">· {c.kind}</span>}
                            </p>
                            {c.note && <p className="mt-2 border-t border-dashed border-line-2 pt-2 text-xs text-mute">{c.note}</p>}
                            <div className="mt-2 flex justify-between">
                              <button type="button" disabled={col === BOARD_COLUMNS[0]} onClick={() => shift(c, -1)} className="rounded-full px-2 text-mute hover:text-text disabled:opacity-20" aria-label="Mover para a coluna anterior">
                                ←
                              </button>
                              <button type="button" disabled={col === BOARD_COLUMNS.at(-1)} onClick={() => shift(c, 1)} className="rounded-full px-2 text-mute hover:text-lime disabled:opacity-20" aria-label="Mover para a próxima coluna">
                                →
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                  {isOver && over.index >= list.length && <li className="h-1 rounded-full bg-lime" />}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
