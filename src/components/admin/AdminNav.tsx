"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const TABS = [
  { href: "/admin", label: "Pedidos" },
  { href: "/admin/quadro", label: "Quadro" },
  { href: "/admin/progresso", label: "Progresso" },
  { href: "/admin/galeria", label: "Galeria" },
  { href: "/admin/vagas", label: "Vagas" },
];

export function AdminNav({ newOrders }: { newOrders: number }) {
  const path = usePathname();
  return (
    <nav aria-label="Painel" className="no-scrollbar -mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1">
        {TABS.map((t) => {
          const active = t.href === "/admin" ? path === "/admin" : path.startsWith(t.href);
          return (
            <li key={t.href} className="relative">
              {active && <motion.span layoutId="admin-tab" className="absolute inset-0 rounded-full bg-lime" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <Link href={t.href} className={cn("relative flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap", active ? "text-ink" : "text-mute hover:text-text")}>
                {t.label}
                {t.href === "/admin" && newOrders > 0 && <span className="rounded-full bg-rose px-1.5 font-mono text-[0.65rem] text-ink">{newOrders}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
