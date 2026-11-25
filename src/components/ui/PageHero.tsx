import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";

type Props = { n: string; kicker: string; title: string; accent: string; children?: React.ReactNode; aside?: React.ReactNode };

/** Abertura das páginas internas. */
export function PageHero({ n, kicker, title, accent, children, aside }: Props) {
  return (
    <section className="shell grid gap-10 pt-36 pb-16 md:pt-44 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
      <div>
        <p className="label mb-6 flex items-center gap-3 text-mute">
          <span className="text-lime">{n}</span>
          <span className="stitch w-12 text-line-2" />
          {kicker}
        </p>
        <h1 className="display text-[clamp(3.2rem,10vw,9rem)]">
          <SplitText text={title} trigger="mount" />
          <Reveal mode="fade" delay={0.35} as="p">
            <span className="serif-i block font-normal tracking-tight text-lime">{accent}</span>
          </Reveal>
        </h1>
        {children && (
          <Reveal delay={0.45} className="mt-8 max-w-xl text-lg text-mute">
            {children}
          </Reveal>
        )}
      </div>
      {aside && <Reveal delay={0.55}>{aside}</Reveal>}
    </section>
  );
}
