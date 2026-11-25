"use client";

import { AnimatePresence, motion, type PanInfo } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

import { CATEGORY_LABEL, ITEM_STATUS_LABEL, type GalleryItem } from "@/lib/schema";

type Props = { items: GalleryItem[]; index: number | null; onIndex: (i: number | null) => void };

/** Lightbox acessível: Esc fecha, ←/→ navegam, arrastar troca no touch, foco preso no diálogo. */
export function Lightbox({ items, index, onIndex }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = index !== null;
  const item = open ? items[index] : null;

  const go = useCallback((d: number) => index !== null && onIndex((index + d + items.length) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement;
    document.documentElement.style.overflow = "hidden";
    dialog.current?.focus();
    return () => {
      document.documentElement.style.overflow = "";
      opener.current?.focus();
    };
  }, [open]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") onIndex(null);
    else if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "Tab") {
      const f = dialog.current?.querySelectorAll<HTMLElement>("button");
      if (!f?.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -80) go(1);
    else if (info.offset.x > 80) go(-1);
    else if (info.offset.y > 120) onIndex(null);
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} (${index! + 1} de ${items.length})`}
          tabIndex={-1}
          onKeyDown={onKey}
          className="fixed inset-0 z-[90] grid grid-rows-[auto_1fr_auto] bg-ink/95 outline-none backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center justify-between gap-4 px-[var(--gutter)] py-4">
            <p className="label text-mute">
              <span className="text-lime">{String(index! + 1).padStart(2, "0")}</span> / {String(items.length).padStart(2, "0")}
            </p>
            <button type="button" onClick={() => onIndex(null)} className="btn btn-ghost py-2 text-sm">
              Fechar <span aria-hidden>✕</span>
            </button>
          </div>

          <div className="relative min-h-0 px-[var(--gutter)]" onClick={(e) => e.target === e.currentTarget && onIndex(null)}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={item.id}
                className="relative mx-auto h-full w-full max-w-6xl cursor-grab active:cursor-grabbing"
                initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                drag
                dragSnapToOrigin
                dragElastic={0.6}
                onDragEnd={onDragEnd}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="100vw"
                  unoptimized={item.src.startsWith("/u/")}
                  placeholder={item.blur ? "blur" : "empty"}
                  blurDataURL={item.blur || undefined}
                  className="pointer-events-none object-contain"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 px-[var(--gutter)] py-5">
            <div className="max-w-xl">
              <p className="label mb-2 text-mute">
                {CATEGORY_LABEL[item.category]} · {item.tag} · {ITEM_STATUS_LABEL[item.status]}
              </p>
              <p className="text-2xl font-semibold tracking-tight">{item.title}</p>
              <p className="text-mute">{item.caption}</p>
            </div>
            {items.length > 1 && (
              <div className="flex gap-2">
                <button type="button" onClick={() => go(-1)} className="btn btn-ghost size-12 p-0" aria-label="Anterior">
                  ←
                </button>
                <button type="button" onClick={() => go(1)} className="btn btn-ghost size-12 p-0" aria-label="Próxima">
                  →
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
