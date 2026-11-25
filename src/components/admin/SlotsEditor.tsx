"use client";

import { useState, useTransition } from "react";

import { saveSlots } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { CATEGORY_LABEL, type Slots } from "@/lib/schema";

export function SlotsEditor({ slots }: { slots: Slots }) {
  const [s, setS] = useState(slots);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const keys = Object.keys(s) as (keyof Slots)[];
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          await saveSlots(s);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        });
      }}
    >
      <ul className="grid gap-4 md:grid-cols-2">
        {keys.map((k) => (
          <li key={k} className="rounded-2xl bg-ink-2 p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold">{CATEGORY_LABEL[k]}</p>
              <button
                type="button"
                role="switch"
                aria-checked={s[k].open}
                onClick={() => setS({ ...s, [k]: { ...s[k], open: !s[k].open } })}
                className={cn("relative h-7 w-12 rounded-full transition-colors", s[k].open ? "bg-lime" : "bg-ink-3")}
              >
                <span className="sr-only">Vagas abertas</span>
                <span className={cn("absolute top-1 size-5 rounded-full bg-ink transition-all", s[k].open ? "left-6" : "left-1 bg-mute")} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-[6rem_1fr] gap-2">
              <label className="text-xs text-mute">
                Vagas
                <input type="number" min={0} max={99} className="admin-input mt-1" value={s[k].slots} onChange={(e) => setS({ ...s, [k]: { ...s[k], slots: Number(e.target.value) } })} />
              </label>
              <label className="text-xs text-mute">
                Observação
                <input className="admin-input mt-1" value={s[k].note} placeholder="ex.: Sob consulta" onChange={(e) => setS({ ...s, [k]: { ...s[k], note: e.target.value } })} />
              </label>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center gap-3">
        <button className="rounded-full bg-lime px-5 py-2 text-sm font-semibold text-ink" disabled={pending}>
          {pending ? "Salvando…" : "Salvar vagas"}
        </button>
        {saved && <span className="text-sm text-lime">Salvo!</span>}
      </div>
    </form>
  );
}
