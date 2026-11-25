"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";

import { ArtCard } from "@/components/gallery/ArtCard";
import { Lightbox } from "@/components/gallery/Lightbox";
import { cn } from "@/lib/cn";
import type { GalleryItem } from "@/lib/schema";

type Props = { items: GalleryItem[]; filters?: boolean; empty?: React.ReactNode; columns?: string };

/** Grade em alvenaria (masonry) com filtro por etiqueta e lightbox. */
export function Gallery({ items, filters = true, empty, columns = "columns-1 sm:columns-2 lg:columns-3" }: Props) {
  const tags = useMemo(() => Array.from(new Set(items.map((i) => i.tag).filter(Boolean))), [items]);
  const [tag, setTag] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const shown = tag ? items.filter((i) => i.tag === tag) : items;

  if (!items.length) return <>{empty}</>;

  return (
    <LayoutGroup>
      {filters && tags.length > 1 && (
        <div role="toolbar" aria-label="Filtrar galeria" className="no-scrollbar -mx-[var(--gutter)] mb-8 flex gap-2 overflow-x-auto px-[var(--gutter)]">
          {[null, ...tags].map((t) => {
            const active = tag === t;
            return (
              <button
                key={t ?? "_all"}
                type="button"
                aria-pressed={active}
                onClick={() => setTag(t)}
                className={cn("chip relative px-4 py-2 transition-colors", active ? "text-ink" : "text-mute hover:text-text")}
              >
                {active && <motion.span layoutId="gal-filter" className="absolute inset-0 rounded-full bg-lime" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                {!active && <span className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_var(--color-line-2)]" />}
                <span className="relative">{t ?? "Tudo"}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className={cn("gap-5 [&>*]:mb-5", columns)}>
        <AnimatePresence mode="popLayout">
          {shown.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              className="break-inside-avoid"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (i % 3) * 0.08 }}
            >
              <ArtCard item={item} onOpen={() => setOpen(i)} priority={i < 2} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Lightbox items={shown} index={open} onIndex={setOpen} />
    </LayoutGroup>
  );
}
