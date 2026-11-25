"use client";

import { motion } from "motion/react";
import Image from "next/image";

import type { GalleryItem } from "@/lib/schema";

type Price = { id: string; name: string; price: number; blurb: string; image: GalleryItem | null };

const ACCENTS = ["var(--color-sky)", "var(--color-lilac)", "var(--color-rose)", "var(--color-lime)", "var(--color-amber)", "var(--color-paper)"];

/**
 * Tabela de preços em cartões: o exemplo da arte "espia" de trás do cartão
 * e sobe no hover; o preço é a estrela.
 */
export function PriceCards({ prices }: { prices: Price[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {prices.map((p, i) => (
        <motion.li
          key={p.id}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="group relative isolate overflow-hidden rounded-[1.5rem] bg-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)]"
          style={{ ["--accent" as string]: ACCENTS[i % ACCENTS.length] }}
        >
          <div className="relative h-48 overflow-hidden">
            {p.image ? (
              <Image
                src={p.image.src}
                alt={p.image.alt}
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                placeholder="blur"
                blurDataURL={p.image.blur}
                className="object-cover object-top transition-transform duration-[1.2s] ease-out-luk group-hover:scale-110"
              />
            ) : (
              <div aria-hidden className="absolute inset-0 grid place-items-center bg-[repeating-linear-gradient(135deg,transparent_0_14px,var(--color-ink-3)_14px_15px)]">
                <span className="serif-i text-2xl text-mute">exemplo em breve</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink-2" />
            <span className="absolute top-4 left-4 font-mono text-xs text-white/80">0{i + 1}</span>
          </div>
          <div className="relative -mt-10 p-6 pt-0">
            <p className="text-2xl font-semibold tracking-tight">{p.name}</p>
            <p className="mt-1 min-h-10 text-sm text-mute">{p.blurb}</p>
            <div className="mt-6 flex items-end justify-between">
              <p className="display text-6xl" style={{ color: "var(--accent)" }}>
                <span className="mr-1 align-top text-2xl">R$</span>
                {p.price}
              </p>
              <a href="#pedido" className="label rounded-full px-3 py-2 text-mute shadow-[inset_0_0_0_1px_var(--color-line-2)] transition-colors hover:bg-[var(--accent)] hover:text-ink">
                Pedir →
              </a>
            </div>
          </div>
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-700 ease-out-luk group-hover:scale-x-100" style={{ background: "var(--accent)" }} />
        </motion.li>
      ))}
    </ul>
  );
}
