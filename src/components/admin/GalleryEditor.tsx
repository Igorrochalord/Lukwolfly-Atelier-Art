"use client";

import Image from "next/image";
import { useActionState, useRef, useState, useTransition } from "react";

import { deleteItem, moveItem, updateItem, uploadItem, type UploadState } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { CATEGORIES, CATEGORY_LABEL, ITEM_STATUS, ITEM_STATUS_LABEL, type Category, type GalleryItem } from "@/lib/schema";

function Upload() {
  const form = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, action, pending] = useActionState<UploadState, FormData>(async (prev, fd) => {
    const r = await uploadItem(prev, fd);
    if (r.ok) {
      form.current?.reset();
      setPreview(null);
    }
    return r;
  }, {});
  return (
    <form ref={form} action={action} className="grid gap-4 rounded-2xl border-[1.5px] border-dashed border-line-2 p-5 md:grid-cols-[12rem_1fr]">
      <label className="relative grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-xl bg-ink-2 text-center text-sm text-mute hover:text-text">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {preview ? <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <span>+ Escolher imagem<br />(JPG/PNG/WebP, até 12 MB)</span>}
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
        />
      </label>
      <div className="grid content-start gap-2 sm:grid-cols-2">
        <input name="title" className="admin-input" placeholder="Título" required />
        <input name="tag" className="admin-input" placeholder="Etiqueta (ex.: Partial, Headshot, 60 cm)" />
        <select name="category" className="admin-input" defaultValue="fursuit">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
        <select name="status" className="admin-input" defaultValue="entregue">
          {ITEM_STATUS.map((s) => (
            <option key={s} value={s}>
              {ITEM_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <input name="caption" className="admin-input sm:col-span-2" placeholder="Legenda curta" />
        <input name="alt" className="admin-input sm:col-span-2" placeholder="Descrição da imagem (acessibilidade)" />
        <label className="flex items-center gap-2 text-sm text-mute">
          <input type="checkbox" name="featured" className="accent-lime" /> Destacar na home
        </label>
        <div className="flex items-center justify-end gap-3">
          {state.error && <span className="text-sm text-rose">{state.error}</span>}
          {state.ok && !pending && <span className="text-sm text-lime">Publicado!</span>}
          <button className="rounded-full bg-lime px-5 py-2 text-sm font-semibold text-ink" disabled={pending}>
            {pending ? "Enviando…" : "Publicar"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Item({ it, first, last }: { it: GalleryItem; first: boolean; last: boolean }) {
  const [d, setD] = useState(it);
  const [pending, start] = useTransition();
  const dirty = (["title", "caption", "alt", "tag", "status", "featured", "category"] as const).some((k) => d[k] !== it[k]);
  return (
    <li className={cn("overflow-hidden rounded-2xl bg-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)]", pending && "opacity-60")}>
      <div className="relative aspect-[4/3] bg-ink-3">
        <Image src={it.src} alt={it.alt} fill sizes="300px" unoptimized={it.src.startsWith("/u/")} className="object-cover" />
        <div className="absolute top-2 right-2 flex gap-1">
          <button type="button" disabled={first} onClick={() => start(() => moveItem(it.id, -1))} className="grid size-8 place-items-center rounded-full bg-ink/80 disabled:opacity-30" aria-label="Mover para antes">
            ←
          </button>
          <button type="button" disabled={last} onClick={() => start(() => moveItem(it.id, 1))} className="grid size-8 place-items-center rounded-full bg-ink/80 disabled:opacity-30" aria-label="Mover para depois">
            →
          </button>
        </div>
      </div>
      <div className="grid gap-2 p-3">
        <input className="admin-input" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} aria-label="Título" />
        <div className="grid grid-cols-2 gap-2">
          <input className="admin-input" value={d.tag} onChange={(e) => setD({ ...d, tag: e.target.value })} aria-label="Etiqueta" placeholder="Etiqueta" />
          <select className="admin-input" value={d.status} onChange={(e) => setD({ ...d, status: e.target.value as GalleryItem["status"] })} aria-label="Status">
            {ITEM_STATUS.map((s) => (
              <option key={s} value={s}>
                {ITEM_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <input className="admin-input" value={d.caption} onChange={(e) => setD({ ...d, caption: e.target.value })} aria-label="Legenda" placeholder="Legenda" />
        <input className="admin-input" value={d.alt} onChange={(e) => setD({ ...d, alt: e.target.value })} aria-label="Descrição" placeholder="Descrição (alt)" />
        <div className="flex items-center justify-between gap-2">
          <select className="admin-input w-auto" value={d.category} onChange={(e) => setD({ ...d, category: e.target.value as Category })} aria-label="Categoria">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-mute">
            <input type="checkbox" checked={d.featured} onChange={(e) => setD({ ...d, featured: e.target.checked })} className="accent-lime" /> Destaque
          </label>
        </div>
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => confirm(`Apagar "${it.title}"?`) && start(() => deleteItem(it.id))} className="text-xs text-mute hover:text-rose">
            Apagar
          </button>
          {dirty && (
            <button type="button" onClick={() => start(() => updateItem(it.id, d))} className="rounded-full bg-lime px-3 py-1 text-xs font-semibold text-ink">
              Salvar
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export function GalleryEditor({ items }: { items: GalleryItem[] }) {
  const [cat, setCat] = useState<Category>("fursuit");
  const list = items.filter((i) => i.category === cat);
  return (
    <>
      <Upload />
      <div className="mt-10 mb-5 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={cn("chip px-3 py-1.5", cat === c ? "bg-paper text-paper-ink" : "text-mute shadow-[inset_0_0_0_1px_var(--color-line-2)]")}
          >
            {CATEGORY_LABEL[c]} · {items.filter((i) => i.category === c).length}
          </button>
        ))}
      </div>
      {!list.length && <p className="rounded-2xl border border-dashed border-line-2 p-10 text-center text-mute">Nada publicado nesta categoria ainda.</p>}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((it, i) => (
          <Item key={`${it.id}-${it.position}-${it.title}-${it.status}-${it.category}`} it={it} first={i === 0} last={i === list.length - 1} />
        ))}
      </ul>
    </>
  );
}
