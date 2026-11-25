"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/cn";
import type { GalleryItem } from "@/lib/schema";

export type Service = { href: string; n: string; title: string; accent: string; price: string; blurb: string; image?: GalleryItem; color: string };

/**
 * Painéis de serviço que se expandem (desktop): o painel ativo cresce,
 * revela a foto e a descrição. No mobile viram cartões empilhados.
 */
export function ServicePanels({ services }: { services: Service[] }) {
  const [active, setActive] = useState(0);
  return (
    <ul className="flex flex-col gap-3 lg:h-[34rem] lg:flex-row">
      {services.map((s, i) => {
        const on = active === i;
        return (
          <motion.li
            key={s.href}
            layout
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className={cn("relative min-h-64 overflow-hidden rounded-[1.5rem] lg:min-h-0", on ? "lg:flex-[3.2]" : "lg:flex-1")}
            style={{ backgroundColor: s.color }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href={s.href} className="group absolute inset-0 flex flex-col justify-between p-6 text-ink md:p-8">
              {s.image && (
                <motion.div
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 1.15 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image src={s.image.src} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" placeholder="blur" blurDataURL={s.image.blur} className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
                </motion.div>
              )}
              <div className="relative flex items-start justify-between gap-4">
                <span className={cn("font-mono text-sm transition-colors", on && s.image ? "text-paper" : "text-ink/70")}>{s.n}</span>
                <span className={cn("chip transition-colors", on && s.image ? "bg-paper text-ink" : "bg-ink/10 text-ink")}>{s.price}</span>
              </div>
              <div className={cn("relative transition-colors duration-500", on && s.image ? "text-paper" : "text-ink")}>
                <h3 className="display text-5xl md:text-6xl lg:[writing-mode:var(--wm)]" style={{ ["--wm" as string]: on ? "horizontal-tb" : "vertical-rl" }}>
                  {s.title}
                </h3>
                <p className={cn("serif-i text-2xl", !on && "lg:hidden")}>{s.accent}</p>
                <motion.p
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, y: on ? 0 : 10 }}
                  transition={{ duration: 0.5, delay: on ? 0.2 : 0 }}
                  className={cn("mt-3 max-w-md text-sm opacity-90", !on && "lg:hidden")}
                >
                  {s.blurb} <span className="whitespace-nowrap font-semibold">Ver mais →</span>
                </motion.p>
              </div>
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}
