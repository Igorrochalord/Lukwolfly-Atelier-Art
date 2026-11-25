"use client";

import { useState, useTransition } from "react";

import { addProgress, deleteProgress, updateProgress } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { PROGRESS_KIND_LABEL, PROGRESS_KINDS, STAGES, type ProgressItem, type ProgressKind } from "@/lib/schema";

type Draft = { title: string; client: string; kind: ProgressKind; eta: string; note: string };

function Fields({ d, set }: { d: Draft; set: (d: Draft) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      <input className="admin-input lg:col-span-2" placeholder="Título (ex.: Partial — lobo)" value={d.title} onChange={(e) => set({ ...d, title: e.target.value })} />
      <input className="admin-input" placeholder="Cliente (apelido)" value={d.client} onChange={(e) => set({ ...d, client: e.target.value })} />
      <select className="admin-input" value={d.kind} onChange={(e) => set({ ...d, kind: e.target.value as ProgressKind })}>
        {PROGRESS_KINDS.map((k) => (
          <option key={k} value={k}>
            {PROGRESS_KIND_LABEL[k]}
          </option>
        ))}
      </select>
      <input className="admin-input" placeholder="Previsão (ex.: Mar/2027)" value={d.eta} onChange={(e) => set({ ...d, eta: e.target.value })} />
      <input className="admin-input sm:col-span-2 lg:col-span-5" placeholder="Nota pública (opcional)" value={d.note} onChange={(e) => set({ ...d, note: e.target.value })} />
    </div>
  );
}

function Row({ p }: { p: ProgressItem }) {
  const [d, setD] = useState<Draft>({ title: p.title, client: p.client, kind: p.kind, eta: p.eta, note: p.note });
  const [stage, setStage] = useState(p.stage);
  const [pending, start] = useTransition();
  const dirty = d.title !== p.title || d.client !== p.client || d.kind !== p.kind || d.eta !== p.eta || d.note !== p.note;

  const save = (s = stage) => start(() => updateProgress(p.id, { ...d, stage: s }));

  return (
    <li className={cn("rounded-2xl bg-ink-2 p-5 shadow-[inset_0_0_0_1px_var(--color-line)]", pending && "opacity-70")}>
      <Fields d={d} set={setD} />
      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Etapa atual">
        {[...STAGES, "Concluído"].map((s, i) => (
          <button
            key={s}
            type="button"
            aria-pressed={stage === i}
            onClick={() => {
              setStage(i);
              save(i);
            }}
            className={cn(
              "chip px-3 py-1.5 transition-colors",
              i < stage ? "bg-lime/25 text-lime" : i === stage ? "bg-lime text-ink" : "text-mute shadow-[inset_0_0_0_1px_var(--color-line-2)] hover:text-text",
            )}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-between gap-2">
        <button type="button" onClick={() => confirm(`Remover "${p.title}"?`) && start(() => deleteProgress(p.id))} className="text-xs text-mute hover:text-rose">
          Remover
        </button>
        {dirty && (
          <button type="button" onClick={() => save()} className="rounded-full bg-lime px-4 py-1.5 text-sm font-semibold text-ink">
            Salvar alterações
          </button>
        )}
      </div>
    </li>
  );
}

export function ProgressEditor({ items }: { items: ProgressItem[] }) {
  const blank: Draft = { title: "", client: "", kind: "fursuit", eta: "", note: "" };
  const [d, setD] = useState<Draft>(blank);
  const [pending, start] = useTransition();
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!d.title.trim()) return;
          start(() => addProgress(d).then(() => setD(blank)));
        }}
        className="mb-8 rounded-2xl border-[1.5px] border-dashed border-line-2 p-5"
      >
        <p className="label mb-3 text-mute">Nova encomenda</p>
        <Fields d={d} set={setD} />
        <button className="mt-3 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink" disabled={pending}>
          Adicionar
        </button>
      </form>
      <ul className="space-y-4">
        {items.map((p) => (
          <Row key={`${p.id}-${p.updatedAt}`} p={p} />
        ))}
      </ul>
    </>
  );
}
