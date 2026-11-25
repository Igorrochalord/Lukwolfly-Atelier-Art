import type { Metadata } from "next";

import { OrderForm } from "@/components/forms/OrderForm";
import { PageHero } from "@/components/ui/PageHero";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Orçamento", description: "Peça orçamento de fursuit, pelúcia, acessório ou arte digital." };

export default function OrcamentoPage() {
  return (
    <>
      <PageHero
        n="06"
        kicker="Orçamento"
        title="Bora tirar"
        accent="seu personagem do papel?"
        aside={
          <div className="rounded-[1.25rem] bg-ink-2 p-6 text-sm text-mute shadow-[inset_0_0_0_1px_var(--color-line)]">
            Prefere conversar direto? <br />
            <a className="draw-line text-text" href={site.telegram.url} target="_blank" rel="noreferrer">
              Telegram {site.telegram.handle}
            </a>{" "}
            ·{" "}
            <a className="draw-line text-text" href={site.instagram.url} target="_blank" rel="noreferrer">
              Instagram {site.instagram.handle}
            </a>
          </div>
        }
      >
        Escolha o tipo, deixe nome, e-mail e Telegram. Eu respondo com valores, prazo e próximos passos.
      </PageHero>
      <section className="shell">
        <div className="rounded-[1.75rem] bg-ink-2 p-6 shadow-[inset_0_0_0_1px_var(--color-line)] md:p-12">
          <OrderForm />
        </div>
      </section>
    </>
  );
}
