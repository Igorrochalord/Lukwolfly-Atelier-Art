import type { Metadata } from "next";

import { OrderForm } from "@/components/forms/OrderForm";
import { Gallery } from "@/components/gallery/Gallery";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHead } from "@/components/ui/SectionHead";
import { SlotBadge } from "@/components/ui/SlotBadge";
import { repo } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Acessórios", description: "Caudas, orelhas, patas e outros acessórios furry — catálogo em preparação." };

/** Espaço reservado: assim que houver itens na categoria "acessorios" (via /admin), a galeria aparece. */
const SOON = ["Caudas", "Orelhas", "Patas", "Coleiras", "Chaveiros", "Mimos"];

export default function AcessoriosPage() {
  const items = repo.gallery.list("acessorios");
  const slot = repo.slots.get().acessorios;
  return (
    <>
      <PageHero n="04" kicker="Acessórios" title="Acessórios" accent="catálogo em costura." aside={<SlotBadge slot={slot} />}>
        Também faço acessórios! A lista completa, com fotos e valores, está sendo preparada. Enquanto isso, dá pra pedir orçamento direto.
      </PageHero>

      <section className="shell">
        {items.length ? (
          <Gallery items={items} />
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {SOON.map((s, i) => (
              <Reveal as="li" key={s} delay={i * 0.06} className="group relative aspect-[4/3] overflow-hidden rounded-[1.25rem] border-[1.5px] border-dashed border-line-2">
                <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_16px,var(--color-ink-2)_16px_17px)] transition-transform duration-[1.5s] ease-out-luk group-hover:scale-125" />
                <div className="relative flex h-full flex-col justify-between p-5">
                  <span className="chip self-start text-mute shadow-[inset_0_0_0_1px_var(--color-line-2)]">em breve</span>
                  <p className="display text-3xl md:text-5xl">{s}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        )}
      </section>

      <section className="shell pt-28" id="pedido">
        <SectionHead n="A" kicker="Orçamento" title="Tem algo" accent="em mente?" />
        <div className="mt-12 rounded-[1.75rem] bg-ink-2 p-6 shadow-[inset_0_0_0_1px_var(--color-line)] md:p-12">
          <OrderForm kind="acessorio" />
        </div>
      </section>
    </>
  );
}
