import type { Metadata } from "next";

import { OrderForm } from "@/components/forms/OrderForm";
import { FurCompare } from "@/components/fursuit/FurCompare";
import { EmptyShelf } from "@/components/gallery/EmptyShelf";
import { Gallery } from "@/components/gallery/Gallery";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHead } from "@/components/ui/SectionHead";
import { SlotBadge } from "@/components/ui/SlotBadge";
import { furComparison, fursuitTypes } from "@/content/site";
import { repo } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Fursuits",
  description: "Fursuits sob medida — head, partial e fullsuit, com pelo nacional ou internacional. Orçamento sob consulta.",
};

export default function FursuitsPage() {
  const items = repo.gallery.list("fursuit");
  const slots = repo.slots.get();
  return (
    <>
      <PageHero n="01" kicker="Fursuits" title="Fursuits" accent="sob medida, sob consulta." aside={<SlotBadge slot={slots.fursuit} />}>
        Cada fursuit nasce da referência do seu personagem: base, padrão, pelo, costura e detalhes, tudo à mão. O valor depende do tipo, do pelo e da complexidade — por isso é sempre sob consulta.
      </PageHero>

      <section className="shell">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {fursuitTypes.map((t, i) => (
            <Reveal as="li" key={t.name} delay={i * 0.08} className="group relative overflow-hidden rounded-[1.25rem] bg-ink-2 p-6 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <span className="font-mono text-xs text-mute">0{i + 1}</span>
              <p className="display mt-10 text-4xl transition-colors duration-500 group-hover:text-sky">{t.name}</p>
              <p className="mt-2 text-sm text-mute">{t.detail}</p>
              <span aria-hidden className="absolute -right-6 -bottom-6 size-24 rounded-full border-[1.5px] border-dashed border-line-2 transition-transform duration-700 ease-out-luk group-hover:scale-150 group-hover:rotate-90" />
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="shell pt-28">
        <SectionHead n="A" kicker="Galeria" title="Já passaram" accent="pela bancada." />
        <div className="mt-12">
          <Gallery
            items={items}
            empty={
              <EmptyShelf title="Galeria em montagem">
                As fotos das fursuits entregues entram aqui assim que forem publicadas pelo painel.
              </EmptyShelf>
            }
          />
        </div>
      </section>

      <section className="shell pt-28" aria-labelledby="pelos">
        <SectionHead n="B" kicker="Materiais" title="Pelo nacional" accent="ou internacional?">
          <p id="pelos">Os dois funcionam — a escolha muda toque, movimento, prazo e custo. Passe o mouse para destacar um lado.</p>
        </SectionHead>
        <div className="mt-12">
          <FurCompare rows={furComparison.rows} note={furComparison.note} />
        </div>
      </section>

      <section className="shell pt-28" id="pedido">
        <SectionHead n="C" kicker="Orçamento" title="Vamos conversar" accent="sobre a sua fursuit.">
          <p>Deixe nome, e-mail e Telegram — respondo com valores, prazos e próximos passos.</p>
        </SectionHead>
        <div className="mt-12 rounded-[1.75rem] bg-ink-2 p-6 shadow-[inset_0_0_0_1px_var(--color-line)] md:p-12">
          <OrderForm kind="fursuit" />
        </div>
      </section>
    </>
  );
}
