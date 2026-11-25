import { SplitText } from "@/components/motion/SplitText";
import { cn } from "@/lib/cn";

type Props = { n: string; kicker: string; title: string; accent?: string; children?: React.ReactNode; className?: string };

/** Cabeçalho de seção: número + kicker em mono, título com palavra-acento em serifa itálica. */
export function SectionHead({ n, kicker, title, accent, children, className }: Props) {
  return (
    <header className={cn("grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:items-end", className)}>
      <div>
        <p className="label mb-5 flex items-center gap-3 text-mute">
          <span className="text-lime">{n}</span>
          <span className="stitch w-10 text-line-2" />
          {kicker}
        </p>
        <h2 className="display text-[clamp(2.6rem,6.5vw,5.75rem)]">
          <SplitText text={title} />
          {accent && <span className="serif-i block text-[1.02em] font-normal tracking-tight text-lime">{accent}</span>}
        </h2>
      </div>
      {children && <div className="text-mute md:pb-2">{children}</div>}
    </header>
  );
}
