import type { Metadata } from "next";

import { PriceCards } from "@/components/artes/PriceCards";
import { OrderForm } from "@/components/forms/OrderForm";
import { EmptyShelf } from "@/components/gallery/EmptyShelf";
import { Gallery } from "@/components/gallery/Gallery";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHead } from "@/components/ui/SectionHead";
import { SlotBadge } from "@/components/ui/SlotBadge";
import { artExtras, artPrices } from "@/content/site";
import { repo } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Artes",
  description: "Commissions de arte furry: headshot, halfbody, fullbody, referência e badges digitais ou físicas.",
};

export default function ArtesPage() {
  const items = repo.gallery.list("artes");
  const slots = repo.slots.get();
  const byId = (id: string | null) => (id ? (repo.gallery.get(id) ?? null) : null);
  const prices = artPrices.map((p) => ({ ...p, image: byId(p.image) }));

  return (
    <>
      <PageHero n="02" kicker="Artes digitais" title="Artes" accent="do rabisco à cor final." aside={<SlotBadge slot={slots.artes} />}>
        Do headshot rapidinho à ref sheet completa. Você acompanha cada fase no quadro da agenda: fila, rascunho, lineart, cor e finalizado.
      </PageHero>

      <section className="shell">
        <PriceCards prices={prices} />
        <Reveal className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap items-center gap-3 rounded-[1.25rem] bg-ink-2 p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
            {artExtras.map((e) => (
              <span key={e.label} className="chip bg-paper text-paper-ink">
                + R${e.price} · {e.label}
              </span>
            ))}
            <span className="text-sm text-mute">Adicionais somam ao valor base de cada arte.</span>
          </div>
          <div className="flex items-center gap-3 rounded-[1.25rem] border-[1.5px] border-dashed border-rose/60 p-5 text-sm">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-rose font-mono text-xs font-bold text-ink">18+</span>
            <span className="text-mute">Artes NSFW só para maiores de idade e não aparecem na galeria pública.</span>
          </div>
        </Reveal>
      </section>

      <section className="shell pt-28">
        <SectionHead n="A" kicker="Galeria" title="Traços" accent="recentes." />
        <div className="mt-12">
          <Gallery items={items} empty={<EmptyShelf title="Galeria em montagem" />} />
        </div>
      </section>

      <section className="shell pt-28" id="pedido">
        <SectionHead n="B" kicker="Commission" title="Monte seu" accent="pedido de arte.">
          <p>Escolha o tipo, some extras e veja a estimativa na hora. O valor final é confirmado na conversa.</p>
        </SectionHead>
        <div className="mt-12 rounded-[1.75rem] bg-ink-2 p-6 shadow-[inset_0_0_0_1px_var(--color-line)] md:p-12">
          <OrderForm kind="arte" />
        </div>
      </section>
    </>
  );
}
