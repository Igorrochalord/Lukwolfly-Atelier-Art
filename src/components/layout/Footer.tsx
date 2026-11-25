"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { nav, site } from "@/content/site";

export function Footer() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <footer className="relative mt-32 overflow-hidden bg-paper text-paper-ink">
      <div className="stitch text-paper-ink/40" />
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="serif-i text-3xl leading-tight md:text-4xl">
            Feito à mão, ponto por ponto —<br /> do rascunho à última costura.
          </p>
          <Link href="/orcamento" className="btn btn-ink mt-8">
            Pedir orçamento <span aria-hidden>→</span>
          </Link>
        </div>
        <nav aria-label="Rodapé">
          <p className="label mb-4 text-paper-ink/50">Mapa</p>
          <ul className="space-y-2">
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="draw-line">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="label mb-4 text-paper-ink/50">Contato</p>
          <ul className="space-y-2">
            <li>
              <a className="draw-line" href={site.instagram.url} target="_blank" rel="noreferrer">
                Instagram {site.instagram.handle}
              </a>
            </li>
            <li>
              <a className="draw-line" href={site.telegram.url} target="_blank" rel="noreferrer">
                Telegram {site.telegram.handle}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none select-none overflow-hidden px-[var(--gutter)]">
        <p className="display translate-y-[0.12em] text-center text-[clamp(4rem,19vw,20rem)] leading-[0.8] text-paper-ink">
          Lukwolfly
        </p>
      </div>
      <div className="relative z-10 flex flex-wrap justify-between gap-2 bg-paper-ink px-[var(--gutter)] py-4 font-mono text-[0.68rem] tracking-wider text-paper/60 uppercase">
        <span>© {new Date().getFullYear()} {site.full}</span>
        <span>Artes 18+ somente sob pedido · galeria pública SFW</span>
      </div>
    </footer>
  );
}
