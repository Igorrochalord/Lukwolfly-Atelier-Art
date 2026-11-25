import type { Metadata } from "next";

import { Board } from "@/components/agenda/Board";
import { ProgressList } from "@/components/agenda/ProgressList";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHead } from "@/components/ui/SectionHead";
import { SlotBadge } from "@/components/ui/SlotBadge";
import { repo } from "@/lib/repo";
import { CATEGORY_LABEL, STAGES } from "@/lib/schema";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Agenda",
  description: "Acompanhe ao vivo o progresso das fursuits e pelúcias e a fila de desenhos da Lukwolfly.",
};

export default function AgendaPage() {
  const progress = repo.progress.list();
  const board = repo.board.list();
  const slots = repo.slots.get();
  const active = progress.filter((p) => p.stage < STAGES.length).length;
  const inQueue = board.filter((c) => c.column !== "finalizado").length;

  return (
    <>
      <PageHero
        n="05"
        kicker="Agenda"
        title="Agenda"
        accent="tudo que está na bancada."
        aside={
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.25rem] bg-ink-2 p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <dt className="label text-mute">Em produção</dt>
              <dd className="display mt-3 text-6xl text-lime">{String(active).padStart(2, "0")}</dd>
            </div>
            <div className="rounded-[1.25rem] bg-ink-2 p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <dt className="label text-mute">Desenhos na fila</dt>
              <dd className="display mt-3 text-6xl text-lilac">{String(inQueue).padStart(2, "0")}</dd>
            </div>
          </dl>
        }
      >
        Encomendas confirmadas aparecem aqui só com o apelido do cliente. Atualizado direto da bancada.
      </PageHero>

      <section className="shell">
        <Reveal mode="fade" className="flex flex-wrap gap-2">
          {(Object.keys(slots) as (keyof typeof slots)[]).map((k) => (
            <span key={k} className="flex items-center gap-2">
              <span className="label text-mute">{CATEGORY_LABEL[k]}</span>
              <SlotBadge slot={slots[k]} />
            </span>
          ))}
        </Reveal>
      </section>

      <section className="shell pt-20" aria-labelledby="progresso">
        <SectionHead n="A" kicker="Fursuits & pelúcias" title="Progresso" accent="etapa por etapa.">
          <p id="progresso">{STAGES.join(" → ")}</p>
        </SectionHead>
        <div className="mt-12">
          <ProgressList items={progress} />
        </div>
      </section>

      <section className="shell pt-28" aria-labelledby="quadro">
        <SectionHead n="B" kicker="Desenhos" title="Quadro" accent="da fila de artes.">
          <p id="quadro">Arraste para o lado para ver todas as colunas.</p>
        </SectionHead>
        <div className="mt-12">
          <Board cards={board} />
        </div>
      </section>
    </>
  );
}
