"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Mark } from "@/components/brand/Mark";
import { nav } from "@/content/site";
import { cn } from "@/lib/cn";

/** Header flutuante: some ao rolar pra baixo, volta ao rolar pra cima. */
export function Header() {
  const path = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    setHidden(y > 240 && y > prev && !open);
  });

  // fecha o menu ao trocar de rota (ajuste de estado durante o render)
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) {
    setLastPath(path);
    setOpen(false);
  }
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (path.startsWith("/admin")) return null;

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-60 gutter pt-3"
        animate={{ y: hidden ? "-120%" : "0%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={cn(
            "mx-auto flex h-14 max-w-[92rem] items-center justify-between gap-4 rounded-full pr-2 pl-4 transition-[background-color,box-shadow,backdrop-filter] duration-500",
            solid ? "bg-ink-2/80 shadow-[inset_0_0_0_1px_var(--color-line)] backdrop-blur-xl" : "bg-transparent",
          )}
        >
          <Link href="/" className="group flex items-center gap-2.5" aria-label="Lukwolfly — início">
            <Mark className="size-8 text-lime transition-transform duration-700 ease-out-luk group-hover:rotate-[24deg]" />
            <span className="leading-none">
              <span className="block text-[1.05rem] font-bold tracking-tight">Lukwolfly</span>
              <span className="serif-i block text-[0.8rem] text-mute">atelier &amp; art</span>
            </span>
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((l) => {
                const active = path.startsWith(l.href);
                return (
                  <li key={l.href} className="relative">
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-ink-3 shadow-[inset_0_0_0_1px_var(--color-line-2)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={cn("relative flex items-baseline gap-1.5 rounded-full px-4 py-2 text-sm transition-colors", active ? "text-text" : "text-mute hover:text-text")}
                    >
                      <span className="font-mono text-[0.6rem] text-lime/80">{l.n}</span>
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/orcamento" className="btn btn-lime hidden py-2.5 text-sm sm:inline-flex">
              Pedir orçamento
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              className="relative grid size-11 place-items-center rounded-full bg-ink-3 lg:hidden"
            >
              <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
              <span aria-hidden className="relative block h-3 w-5">
                <span className={cn("absolute left-0 h-[1.5px] w-full bg-current transition-all duration-500 ease-out-luk", open ? "top-1/2 rotate-45" : "top-0")} />
                <span className={cn("absolute left-0 h-[1.5px] w-full bg-current transition-all duration-500 ease-out-luk", open ? "top-1/2 -rotate-45" : "top-full")} />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-50 flex flex-col justify-end bg-paper px-[var(--gutter)] pt-24 pb-10 text-paper-ink lg:hidden"
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="space-y-1">
              {[{ href: "/", label: "Início", n: "00" }, ...nav, { href: "/orcamento", label: "Orçamento", n: "06" }].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={l.href} className="flex items-baseline gap-3 border-b border-paper-ink/15 py-2">
                    <span className="font-mono text-xs text-paper-ink/50">{l.n}</span>
                    <span className="display text-[clamp(2.4rem,11vw,4rem)]">{l.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
