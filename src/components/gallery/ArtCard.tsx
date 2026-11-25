"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { cn } from "@/lib/cn";
import { CATEGORY_LABEL, ITEM_STATUS_LABEL, type GalleryItem } from "@/lib/schema";

const STATUS_COLOR: Record<GalleryItem["status"], string> = {
  portfolio: "bg-paper text-paper-ink",
  disponivel: "bg-lime text-ink",
  producao: "bg-amber text-ink",
  entregue: "bg-sky text-ink",
};

type Props = {
  item: GalleryItem;
  onOpen?: () => void;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** "fill" ocupa o contêiner (aspect definido fora); "natural" usa a proporção da imagem. */
  fit?: "natural" | "fill";
};

/**
 * Card de imagem: inclinação 3D que segue o cursor, reflexo de luz,
 * zoom suave, etiqueta de costura com a categoria e legenda que sobe no hover.
 * Teclado: Enter/Espaço abre o lightbox.
 */
export function ArtCard({ item, onOpen, sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw", priority, className, fit = "natural" }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotionSafe();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rx = useSpring(useTransform(py, [0, 1], [7, -7]), spring);
  const ry = useSpring(useTransform(px, [0, 1], [-9, 9]), spring);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,.28), transparent 45%)`;

  function onMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = ref.current!.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  const unoptimized = item.src.startsWith("/u/");

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onOpen}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={cn("group relative block w-full text-left outline-offset-4 [transform-style:preserve-3d]", className)}
      aria-label={`${item.title} — ${CATEGORY_LABEL[item.category]}${item.tag ? `, ${item.tag}` : ""}. Abrir imagem ampliada.`}
    >
      <div className={cn("relative overflow-hidden rounded-[1.25rem] bg-ink-3 shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)]", fit === "fill" && "h-full")}>
        <Image
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          sizes={sizes}
          priority={priority}
          unoptimized={unoptimized}
          placeholder={item.blur ? "blur" : "empty"}
          blurDataURL={item.blur || undefined}
          className={cn(
            "w-full transition-[transform,filter] duration-[1.1s] ease-out-luk group-hover:scale-[1.06] group-focus-visible:scale-[1.06]",
            fit === "fill" ? "h-full object-cover" : "h-auto",
          )}
        />
        {/* vinheta + legenda */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/0 to-ink/0 opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100" style={{ background: glare }} />
        <div aria-hidden className="pointer-events-none absolute inset-2 rounded-[0.9rem] border-[1.5px] border-dashed border-white/0 transition-colors duration-500 group-hover:border-white/35" />

        <span className={cn("chip absolute top-3 right-3", STATUS_COLOR[item.status])}>{ITEM_STATUS_LABEL[item.status]}</span>

        <div className="absolute inset-x-0 bottom-0 p-4 [transform:translateZ(30px)] md:p-5">
          <span className="tag">{item.tag || CATEGORY_LABEL[item.category]}</span>
          <p className="mt-2 text-xl font-semibold tracking-tight text-white">{item.title}</p>
          <p className="grid grid-rows-[0fr] text-sm text-white/75 transition-[grid-template-rows] duration-500 ease-out-luk group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
            <span className="overflow-hidden">{item.caption}</span>
          </p>
        </div>
      </div>
    </motion.button>
  );
}
