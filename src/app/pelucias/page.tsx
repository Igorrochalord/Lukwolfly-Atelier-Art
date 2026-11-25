import type { Metadata } from "next";
import Image from "next/image";

import { OrderForm } from "@/components/forms/OrderForm";
import { EmptyShelf } from "@/components/gallery/EmptyShelf";
import { Gallery } from "@/components/gallery/Gallery";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHead } from "@/components/ui/SectionHead";
import { SlotBadge } from "@/components/ui/SlotBadge";
import { plush } from "@/content/site";
import { repo } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Pelúcias",
  description: `Pelúcias do seu personagem com ${plush.height}. Vaga com desconto: R$${plush.promo} se as cores já estiverem em mão.`,
};

export default function PeluciasPage() {
  const all = repo.gallery.list("pelucias");
  const cover = all.find((g) => g.id === "pelucias-colagem");
  const items = all.filter((g) => g.id !== "pelucias-colagem");
  const slot = repo.slots.get().pelucias;
  const brl = (n: number) => `R$${n}`;

  return (
    <>
      <PageHero n="03" kicker="Pelúcias" title="Pelúcias" accent="pra abraçar seu personagem." aside={<SlotBadge slot={slot} />}>
        Seu personagem em pelúcia de {plush.height} de altura, com cores, marcas e roupinhas sob medida.
      </PageHero>

      <section className="shell">
        <Reveal mode="wipe" className="overflow-hidden rounded-[1.75rem]" innerClassName="">
          <div className="grid overflow-hidden rounded-[1.75rem] bg-lime text-ink lg:grid-cols-[1.1fr_1fr]">
            <div className="flex flex-col justify-between gap-10 p-8 md:p-12">
              <div>
                <span className="tag">{slot.open ? "Vaga aberta" : "Vaga encerrada"}</span>
                <p className="display mt-6 text-[clamp(3rem,7vw,6.5rem)]">Só {brl(plush.promo)}</p>
                <p className="serif-i text-3xl">
                  normalmente por volta de <span className="line-through decoration-2">{brl(plush.regular)}</span>
                </p>
              </div>
              <dl className="grid grid-cols-3 gap-4 border-t-[1.5px] border-dashed border-ink/30 pt-6">
                <div>
                  <dt className="label opacity-60">Altura</dt>
                  <dd className="text-2xl font-semibold">{plush.height}</dd>
                </div>
                <div>
                  <dt className="label opacity-60">Desconto</dt>
                  <dd className="text-2xl font-semibold">{Math.round((1 - plush.promo / plush.regular) * 100)}%</dd>
                </div>
                <div>
                  <dt className="label opacity-60">Condição</dt>
                  <dd className="text-sm font-medium leading-tight">{plush.promoRule}</dd>
                </div>
              </dl>
              <a href="#pedido" className="btn btn-ink self-start">
                Quero essa vaga <span aria-hidden>→</span>
              </a>
            </div>
            {cover && (
              <div className="relative min-h-80">
                <Image src={cover.src} alt={cover.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" placeholder="blur" blurDataURL={cover.blur} className="object-cover" />
              </div>
            )}
          </div>
        </Reveal>
      </section>

      <section className="shell pt-28">
        <SectionHead n="A" kicker="Galeria" title="A turma" accent="que já foi adotada." />
        <div className="mt-12">
          <Gallery items={items} columns="columns-2 lg:columns-3" empty={<EmptyShelf title="Galeria em montagem" />} />
        </div>
      </section>

      <section className="shell pt-28" id="pedido">
        <SectionHead n="B" kicker="Encomenda" title="Sua pelúcia" accent="começa aqui.">
          <p>Mande nome, e-mail, Telegram e a ref do personagem. Se já tiver as cores, a vaga com desconto é sua.</p>
        </SectionHead>
        <div className="mt-12 rounded-[1.75rem] bg-ink-2 p-6 shadow-[inset_0_0_0_1px_var(--color-line)] md:p-12">
          <OrderForm kind="pelucia" />
        </div>
      </section>
    </>
  );
}
