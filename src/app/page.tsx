import Link from "next/link";

import { Board } from "@/components/agenda/Board";
import { ProgressList } from "@/components/agenda/ProgressList";
import { HeroCollage } from "@/components/home/HeroCollage";
import { ProcessThread } from "@/components/home/ProcessThread";
import { ServicePanels, type Service } from "@/components/home/ServicePanels";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Marquee } from "@/components/ui/Marquee";
import { SectionHead } from "@/components/ui/SectionHead";
import { SlotBadge } from "@/components/ui/SlotBadge";
import { artPrices, plush, site, steps } from "@/content/site";
import { repo } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default function Home() {
  const all = repo.gallery.list();
  const byId = (id: string) => all.find((g) => g.id === id);
  const first = (cat: string) => all.find((g) => g.category === cat);
  const slots = repo.slots.get();
  const progress = repo.progress.list().filter((p) => p.stage < 6).slice(0, 2);
  const board = repo.board.list();

  const pins = ["pelucia-05", "arte-halfbody-hiena", "pelucia-02", "arte-badge-seth"].map(byId).filter((x) => x !== undefined);
  const heroItems = pins.length >= 3 ? pins : all.slice(0, 4);

  const services: Service[] = [
    { href: "/fursuits", n: "01", title: "Fursuits", accent: "sob medida", price: "Sob consulta", blurb: "Heads, partials e fullsuits com pelo nacional ou importado.", image: byId("fursuit-heads") ?? first("fursuit"), color: "var(--color-sky)" },
    { href: "/artes", n: "02", title: "Artes", accent: "digitais", price: `A partir de R$${Math.min(...artPrices.map((a) => a.price))}`, blurb: "Headshot, halfbody, fullbody, ref sheet e badges.", image: byId("arte-ref-m4jor") ?? first("artes"), color: "var(--color-lilac)" },
    { href: "/pelucias", n: "03", title: "Pelúcias", accent: "do seu personagem", price: `Promo R$${plush.promo}`, blurb: `Seu personagem com ${plush.height} pra abraçar.`, image: byId("pelucias-colagem") ?? first("pelucias"), color: "var(--color-lime)" },
    { href: "/acessorios", n: "04", title: "Acessórios", accent: "em breve", price: "Em breve", blurb: "Caudas, orelhas, patas e mimos — catálogo em preparação.", image: first("acessorios"), color: "var(--color-rose)" },
  ];

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────── */}
      <section className="shell relative grid min-h-[100svh] items-center gap-10 pt-28 pb-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 size-[38rem] rounded-full bg-lilac/15 blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute right-0 bottom-0 size-[30rem] rounded-full bg-sky/10 blur-[120px]" />
        <div className="relative">
          <Reveal mode="fade" className="label mb-8 flex flex-wrap items-center gap-3 text-mute">
            <span className="text-lime">●</span> Ateliê furry independente
            <span className="stitch w-10 text-line-2" />
            {site.instagram.handle}
          </Reveal>
          <h1 className="display text-[clamp(3.6rem,10.5vw,10rem)]">
            <SplitText text={"Personagens\nque saem"} trigger="mount" by="word" delay={0.1} />
            <span className="flex flex-wrap items-baseline gap-x-[0.2em]">
              <SplitText text="do" trigger="mount" delay={0.3} />
              <Reveal mode="fade" delay={0.7} as="p" className="inline">
                <span className="serif-i font-normal tracking-tight text-lime">papel.</span>
              </Reveal>
            </span>
          </h1>
          <Reveal delay={0.6} className="mt-8 max-w-lg text-lg text-mute">
            Lukwolfly Atelier &amp; Art costura fursuits, pelúcias e acessórios — e desenha seu personagem do headshot à ref sheet.
          </Reveal>
          <Reveal delay={0.75} className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/orcamento" className="btn btn-lime">
              Pedir orçamento <span aria-hidden>→</span>
            </Link>
            <Link href="/agenda" className="btn btn-ghost">
              Ver a agenda
            </Link>
          </Reveal>
          <Reveal delay={0.9} mode="fade" className="mt-10 flex flex-wrap gap-2">
            <SlotBadge slot={slots.artes} />
            <SlotBadge slot={slots.pelucias} />
          </Reveal>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <HeroCollage items={heroItems} />
        </div>
      </section>

      <Marquee
        className="border-y border-line bg-ink-2 py-5 text-[clamp(1.4rem,3vw,2.4rem)] font-semibold tracking-tight"
        items={["Fursuits", "Pelúcias de 60 cm", "Headshots", "Ref sheets", "Badges", "Acessórios", "Feito à mão"]}
      />

      {/* ─── SERVIÇOS ─────────────────────────────────── */}
      <section className="shell pt-28 md:pt-40" aria-labelledby="servicos">
        <SectionHead n="01" kicker="O que sai da bancada" title="Quatro jeitos de" accent="dar vida ao seu personagem.">
          <p id="servicos">Passe o mouse (ou toque) para abrir cada painel. Tudo é feito sob encomenda, uma peça por vez.</p>
        </SectionHead>
        <div className="mt-14">
          <ServicePanels services={services} />
        </div>
      </section>

      {/* ─── PROMO PELÚCIA ────────────────────────────── */}
      {slots.pelucias.open && (
        <section className="shell pt-28">
          <Reveal mode="wipe" className="overflow-hidden rounded-[1.75rem]" innerClassName="">
            <Link href="/pelucias" className="group stitch-box relative grid gap-6 bg-lime p-8 text-ink md:grid-cols-[1fr_auto] md:items-center md:p-12">
              <div>
                <p className="label mb-3">Vaga aberta · pelúcia com desconto</p>
                <p className="display text-[clamp(2.4rem,6vw,5rem)]">
                  Só R${plush.promo} <span className="serif-i font-normal text-ink/60 line-through decoration-2">R${plush.regular}</span>
                </p>
                <p className="mt-2 max-w-lg">
                  Pelúcia de {plush.height} {plush.promoRule}.
                </p>
              </div>
              <span className="grid size-20 place-items-center rounded-full bg-ink text-3xl text-lime transition-transform duration-500 ease-out-luk group-hover:rotate-[-45deg] md:size-28">
                →
              </span>
            </Link>
          </Reveal>
        </section>
      )}

      {/* ─── NA BANCADA ───────────────────────────────── */}
      <section className="shell pt-28 md:pt-40">
        <SectionHead n="02" kicker="Agenda ao vivo" title="Na bancada" accent="agora mesmo.">
          <p>Toda encomenda confirmada aparece aqui — você acompanha cada etapa sem precisar perguntar.</p>
        </SectionHead>
        <div className="mt-14 grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <ProgressList items={progress} />
          <Board cards={board} />
        </div>
        <Reveal className="mt-10">
          <Link href="/agenda" className="btn btn-ghost">
            Abrir agenda completa <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </section>

      {/* ─── PROCESSO ─────────────────────────────────── */}
      <section className="shell pt-28 md:pt-40">
        <SectionHead n="03" kicker="Como funciona" title="Do pedido" accent="à entrega." />
        <div className="mt-16">
          <ProcessThread steps={steps} />
        </div>
      </section>
    </>
  );
}
