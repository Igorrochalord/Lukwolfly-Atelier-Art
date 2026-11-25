"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useEffect } from "react";

import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import type { GalleryItem } from "@/lib/schema";

type Pin = { item: GalleryItem; className: string; depth: number; rotate: number; delay: number };

function PinCard({ pin, mx, my }: { pin: Pin; mx: MotionValue<number>; my: MotionValue<number> }) {
  const x = useTransform(mx, (v) => v * pin.depth * 40);
  const y = useTransform(my, (v) => v * pin.depth * 30);
  return (
    <motion.figure
      className={`absolute ${pin.className}`}
      style={{ x, y }}
      initial={{ opacity: 0, y: 80, rotate: pin.rotate * 3, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, rotate: pin.rotate, scale: 1 }}
      transition={{ duration: 1.3, delay: pin.delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="animate-float" style={{ animationDelay: `${pin.delay * -4}s`, ["--r" as string]: "0deg" }}>
        <div className="rounded-[1.1rem] bg-paper p-2 pb-9 shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)]">
          <Image
            src={pin.item.src}
            alt={pin.item.alt}
            width={pin.item.width}
            height={pin.item.height}
            sizes="(min-width: 1024px) 18vw, 40vw"
            placeholder="blur"
            blurDataURL={pin.item.blur}
            priority
            className="h-auto w-full rounded-[0.7rem]"
          />
          <figcaption className="serif-i absolute right-0 bottom-2 left-0 text-center text-[0.95rem] text-paper-ink">{pin.item.title}</figcaption>
        </div>
        {/* alfinete */}
        <span aria-hidden className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full bg-rose shadow-[inset_-2px_-2px_0_rgba(0,0,0,.25)]" />
      </div>
    </motion.figure>
  );
}

/** Colagem de fotos "alfinetadas" que reagem ao mouse com profundidades diferentes. */
export function HeroCollage({ items }: { items: GalleryItem[] }) {
  const reduce = useReducedMotionSafe();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const mx = useSpring(rx, { stiffness: 60, damping: 18 });
  const my = useSpring(ry, { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      rx.set(e.clientX / window.innerWidth - 0.5);
      ry.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, rx, ry]);

  const layout = [
    { className: "left-[2%] top-[8%] w-[46%] z-20", depth: 1.2, rotate: -6, delay: 0.3 },
    { className: "right-[0%] top-[0%] w-[40%] z-10", depth: 0.6, rotate: 5, delay: 0.45 },
    { className: "right-[6%] bottom-[2%] w-[44%] z-30", depth: 1.6, rotate: -3, delay: 0.6 },
    { className: "left-[14%] bottom-[0%] w-[32%] z-0", depth: 0.4, rotate: 8, delay: 0.75 },
  ];
  const pins: Pin[] = items.slice(0, layout.length).map((item, i) => ({ item, ...layout[i] }));

  return (
    <div className="relative aspect-[1/1.05] w-full">
      {pins.map((p) => (
        <PinCard key={p.item.id} pin={p} mx={mx} my={my} />
      ))}
    </div>
  );
}
